// Import the required modules, this is a workaround becase consulconn is not an ESM module
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const SAGConsulConnector = require('@sag/consulconn')
const { SagRegistroLog: sagLog } = require('@sag/registrologs')

import { Env } from '@adonisjs/core/env'

interface Config {
    app: AppConfig
    dbConfigValue: string
    redisConfigValue: string
    blobConfigValue: string
}

interface AppConfig {
    port: number
    host: string
    appKey: string
    logLevel: string
    sagLogApp: string
}

interface DbConfig {
    server: string
    port: number
    user: string
    password: string
    database: string
}

interface RedisConfig {
    host: string
    port: number
    password: string
    expireSeconds: number
}

interface BlobConfig {
    blobStorageConnectionString: string
    blobStorageContainerName: string
    blobStorageAccountName: string
}

// Create a function to get the environment variables from consul
export default async function ConsulEnv(): Promise<void> {

    // Get the environment variables from consul
    await Env.create(new URL('../', import.meta.url), { 
        CONSUL_HOST: Env.schema.string(),
        CONSUL_PORT: Env.schema.number(),
        CONSUL_PROMISIFY: Env.schema.boolean(),
        CONSUL_REJECT_UNAUTHORIZED: Env.schema.boolean(),
        CONSUL_SECURE: Env.schema.boolean(),
        CONSUL_ACL_TOKEN: Env.schema.string(),
        APP_NAME: Env.schema.string(),
        APP_PORT: Env.schema.number(),
        APP_URL: Env.schema.string(),
        APP_URL_HEALTH: Env.schema.string(),
    })

    sagLog.log('Getting the configuration from consul...')
      
    // Create a new instance of SAGConsulConnector
    const sagConsul = new SAGConsulConnector()

    // Initialize the configuration and register the service
    await sagConsul.initializeConfig()
    await sagConsul.registerService()
    
    // Get the configuration
    const config:Config = await sagConsul.getConfig()

    // Get the values of the configuration
    const [ appConfig, dbConfig, redisConfig, blobConfig ] = await Promise.all([
        config.app,
        sagConsul.getConfigValue( config.dbConfigValue ) as DbConfig,
        sagConsul.getConfigValue( config.redisConfigValue ) as RedisConfig,
        sagConsul.getConfigValue( config.blobConfigValue ) as BlobConfig
    ])

    const envValues = [
        { key: 'PORT', value: appConfig.port },
        { key: 'HOST', value: appConfig.host },
        { key: 'APP_KEY', value: appConfig.appKey },
        { key: 'LOG_LEVEL', value: appConfig.logLevel },
        { key: 'SAGLOG_APP', value: appConfig.sagLogApp },
        { key: 'DB_HOST', value: dbConfig.server },
        { key: 'DB_PORT', value: dbConfig.port },
        { key: 'DB_USER', value: dbConfig.user },
        { key: 'DB_PASSWORD', value: dbConfig.password },
        { key: 'DB_DATABASE', value: dbConfig.database },
        { key: 'REDIS_HOST', value: redisConfig.host },
        { key: 'REDIS_PORT', value: redisConfig.port },
        { key: 'REDIS_PASSWORD', value: redisConfig.password },
        { key: 'REDIS_EXPIRE_SECONDS', value: redisConfig.expireSeconds },
        { key: 'BLOB_STORAGE_CONNECTION_STRING', value: blobConfig.blobStorageConnectionString },
        { key: 'BLOB_STORAGE_CONTAINER_NAME', value: blobConfig.blobStorageContainerName },
        { key: 'BLOB_STORAGE_ACCOUNT_NAME', value: blobConfig.blobStorageAccountName }
    ]

    // Set the environment variables
    for (const { key, value } of envValues) {
        try{
            process.env[key] = ( typeof value !== 'string' ) ? value.toString() : value
        }catch(error){
            sagLog.logError(`Error setting the environment variable ${key}: ${error.message}`)
            throw error
        }
    }
}