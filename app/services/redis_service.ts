import env from '#start/env'
import redis from '@adonisjs/redis/services/main'
import { ResponseType } from '../helpers/default_types.js'

const queryStringToKeyString = (queryString: string): string => {
  queryString = JSON.stringify(queryString)
  queryString = queryString.replace(/[^a-zA-Z0-9<=>]/g, '_')
  return queryString
}

export const scanKeysWithPattern = async (
  pattern: string,
  count: number = 10
): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    const keys: string[] = []
    let cursor = '0'

    const patternAll = pattern + '*'

    const scanRecursive = () => {
      redis.scan(cursor, 'MATCH', patternAll, 'COUNT', count, (err, res) => {
        if (err) {
          reject([])
          return
        }

        if (!res) {
          reject([])
          return
        }

        cursor = res[0]
        keys.push(...res[1])
        if (cursor === '0') {
          resolve(keys)
        } else {
          scanRecursive()
        }
      })
    }

    scanRecursive()
  })
}

export const getRedisKeys = {
  all: () => `${env.get('SAGLOG_APP')}`,
  usuarios: {
    base: () => `${env.get('SAGLOG_APP')}:usuarios`,
    index: (queryString?: any) => {
      if (queryString) {
        return `${getRedisKeys.usuarios.base()}:index:${queryStringToKeyString(queryString)}`
      } else {
        return `${getRedisKeys.usuarios.base()}:index`
      }
    },
    show: (uuid: string) => {
      return `${getRedisKeys.usuarios.base()}:show:${uuid}`
    },
  },
}

export const getValue = async (key: string): Promise<ResponseType> => {
  const response: ResponseType = {
    success: false,
    data: null,
  }

  try {
    const value = await redis.get(key)

    if (value) {
      response.success = true
      response.data = value
    }
  } catch (error) {
  }

  return response
}

export const setValue = async (key: string, value: any): Promise<ResponseType> => {
  const response: ResponseType = {
    success: false,
    data: null,
  }

  try {
    const saveValue = await redis.set(key, value, 'EX', env.get('REDIS_EXPIRE_SECONDS', 3600))

    if (saveValue === 'OK') {
      response.success = true
      response.data = value
    }
  } catch (error) {
  }

  return response
}

export const deleteAllKeys = async (): Promise<ResponseType> => {
  const response: ResponseType = {
    success: false,
    data: null,
  }

  try {
    const keys = await scanKeysWithPattern(getRedisKeys.all())

    if (keys && keys.length > 0) {
      for (const key of keys) {
        await deleteValue(key)
      }
    }

    response.success = true
  } catch (error) {
  }

  return response
}

export const deleteValue = async (key: string): Promise<ResponseType> => {
  const response: ResponseType = {
    success: false,
    data: null,
  }

  try {
    const value = await redis.del(key)

    if (value) {
      response.success = true
      response.data = value
    }
  } catch (error) {
  }

  return response
}