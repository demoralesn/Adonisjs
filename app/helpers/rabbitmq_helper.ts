import env from '#start/env'
import replaceSpecialCharacters from 'replace-special-characters'

/**
 * Este método se encarga de formatear el nombre de un exchange de RabbitMQ,
 * agregando el nombre de la app al principio si no está presente. Además,
 * reemplaza los espacios vacíos por guiones bajos.
 * @param exchangeName Es el nombre del exchange
 * @returns Devuelve el nombre del exchange con el nombre de la app al principio
 */
export const formatExchangeName = (exchangeName: string): string => {
  // Remove special characters
  exchangeName = replaceSpecialCharacters(exchangeName)

  // To Lower Case
  exchangeName = exchangeName.toLowerCase()

  // Validate exchange name includes app name
  if (!exchangeName.includes(env.get('APP_NAME'))) {
    exchangeName = `${env.get('APP_NAME')}.${exchangeName}`
  }

  // Replace empty spaces with underscores
  exchangeName = exchangeName.replace(/ /g, '_')

  // If app name is not in the beginning of the exchange name, modify it
  if (!exchangeName.startsWith(env.get('APP_NAME'))) {
    // Get name without app name
    exchangeName = exchangeName.replace(`${env.get('APP_NAME')}`, '')

    // If first character is a dot, remove it
    if (exchangeName.startsWith('.')) {
      exchangeName = exchangeName.substring(1)
    }

    // If last character is a dot, remove it
    if (exchangeName.endsWith('.')) {
      exchangeName = exchangeName.substring(0, exchangeName.length - 1)
    }

    // Finally, add app name at the beginning
    exchangeName = `${env.get('APP_NAME')}.${exchangeName}`
  }

  return exchangeName
}

/**
 * Este método se encarga de formatear el nombre de una cola de RabbitMQ,
 * @param queueName String con el nombre de la cola
 * @returns String con el nombre de la cola formateado
 */
export const formatQueueName = (queueName: string): string => {
  // Remove special characters
  queueName = replaceSpecialCharacters(queueName)

  // To Lower Case
  queueName = queueName.toLowerCase()

  // Replace empty spaces with underscores
  queueName = queueName.replace(/ /g, '_')

  return queueName
}
