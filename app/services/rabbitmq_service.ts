import amqp, { Channel } from 'amqplib'
import env from '#start/env'
import { RabbitServiceResponse, PublishMessage, ConsumeMessages } from '#interfaces/rabbitmq'
import { formatExchangeName, formatQueueName } from '#helpers/rabbitmq_helper'

//SagRegistroLog
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { SagRegistroLog: sagLog } = require('@sag/registrologs')

export default class RabbitMQService {
  static async connectAndCreateChannel(): Promise<Channel> {
    // Connect to RabbitMQ
    const connection = await amqp.connect({
      username: env.get('RABBITMQ_USERNAME'),
      password: env.get('RABBITMQ_PASSWORD'),
      hostname: env.get('RABBITMQ_URL'),
    })

    // Create channel
    const channel = await connection.createChannel()

    // Return channel
    return channel
  }

  static async closeConnection(channel: Channel): Promise<void> {
    // Close channel
    await channel.close()

    // Close connection
    await channel.connection.close()
  }

  static async publishMessage({
    message,
    exchangeName,
    queue = '',
    exchangeType = 'fanout',
    options = {},
  }: PublishMessage): Promise<RabbitServiceResponse> {
    const response: RabbitServiceResponse = {
      success: false,
      data: '',
    }

    try {
      // If exchange name is different from fanout, queue name is mandatory
      if (exchangeType !== 'fanout' && queue === '') {
        response.error =
          'El valor queue es obligatorio si el tipo del exchange es diferente a fanout'
        return response
      }

      // Connect to RabbitMQ
      const rabbitClient = await this.connectAndCreateChannel()

      // Format exchange name
      const exchange = formatExchangeName(exchangeName)

      // Format queue name
      queue = formatQueueName(queue)

      // Create exchange
      await rabbitClient.assertExchange(exchange, exchangeType, options)

      // Send message to RabbitMQ
      rabbitClient.publish(exchange, queue, Buffer.from(message))

      // Set response
      response.success = true
      response.data = `Mensaje enviado a RabbitMQ. Exchange: ${exchange}. Tipo: ${exchangeType}. Queue: ${queue}. Message: ${message}`

      // Log success
      sagLog.log(response.data)

      // Close connection
      await this.closeConnection(rabbitClient)
    } catch (error) {
      response.error = error.message
      sagLog.logError(`Error publicando mensaje en RabbitMQ`, error)
    }

    return response
  }

  static async receiveMessages({
    queue = '',
    exchangeName,
    exchangeType = 'fanout',
    options = {},
    ack = true,
    onMessage = () => {},
  }: ConsumeMessages): Promise<void> {
    try {
      // Connect to RabbitMQ
      const rabbitClient = await this.connectAndCreateChannel()

      await rabbitClient.assertExchange(exchangeName, exchangeType, options)

      // Format queue name
      queue = formatQueueName(queue)

      const q = await rabbitClient.assertQueue(queue, options)

      await rabbitClient.bindQueue(q.queue, exchangeName, '')

      // Consume messages
      rabbitClient.consume(q.queue, (msg) => {
        if (msg === null) {
          return
        }

        // Call onMessage callback
        onMessage(msg.content.toString())

        // Acknowledge message (if ack is true)
        if (ack) {
          rabbitClient.ack(msg)
        }

        // Log message
        sagLog.log(
          `Mensaje recibido de RabbitMQ. Exchange: ${exchangeName}. Queue: ${queue}. Message: ${msg.content.toString()}`
        )
      })

      // Log success
      sagLog.log(`Escuchando mensajes desde RabbitMQ. Exchange: ${exchangeName}. Queue: ${queue}`)
    } catch (error) {
      sagLog.logError(`Error consumiendo mensajes desde RabbitMQ`, error)
    }
  }
}
