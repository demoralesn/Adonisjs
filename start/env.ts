/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'
import ConsulEnv from '#start/consul'

// Get value from environment variable NODE_ENV
await Env.create(new URL('../'
, import.meta.url), {
  NODE_ENV: Env.schema.enum(['local', 'development', 'dev', 'production', 'prod', 'test', 'qa'] as const),
})

// If NODE_ENV is different from 'local', then create the environment variables for consul
if( process.env.NODE_ENV !== 'local' ) {
  await ConsulEnv()
}

export default await Env.create(new URL('../', import.meta.url), {
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  SAGLOG_APP: Env.schema.string(),
  APP_NAME: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring redis connection
  |----------------------------------------------------------
  */
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),
  REDIS_EXPIRE_SECONDS: Env.schema.number(),

  /*
  |----------------------------------------------------------
  | Variables generación JWT
  |----------------------------------------------------------
  */
  JWT_SECRET_KEY: Env.schema.string(),
  JWT_EXPIRES_IN: Env.schema.string.optional(),
  JWT_ALGORITHM: Env.schema.string.optional(),
  JWT_TIME_ZONE: Env.schema.string.optional(),
  JWT_ENTITY: Env.schema.string(),
  
  /*
  |----------------------------------------------------------
  | Variables DGD
  |----------------------------------------------------------
  */
  DGD_API_URL: Env.schema.string(),
  DGD_API_TOKEN_KEY: Env.schema.string(),
  DGD_TOKEN: Env.schema.string(),
  DOC_CHECKSUM: Env.schema.string(),
  
  /*
  |----------------------------------------------------------
  | Variables Blob Storage
  |----------------------------------------------------------
  */
  BLOB_STORAGE_CONNECTION_STRING: Env.schema.string(),
  BLOB_STORAGE_CONTAINER_NAME: Env.schema.string(),
  BLOB_STORAGE_ACCOUNT_NAME: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables RabbitMQ
  |----------------------------------------------------------
  */
  RABBITMQ_URL: Env.schema.string({ format: 'host' }),
  RABBITMQ_USERNAME: Env.schema.string(),
  RABBITMQ_PASSWORD: Env.schema.string()
})
