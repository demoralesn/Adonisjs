export interface RabbitServiceResponse {
    success: boolean
    error?: string
    data: string
  }
  
  export interface PublishMessage extends AssertExchangeBase {
    message: string
  }
  
  export interface ConsumeMessages extends AssertExchangeBase {
    ack: boolean
    options?: AssertQueueOptions
    onMessage?: (msg: string) => void
  }
  
  interface AssertExchangeBase {
    exchangeName: string
    queue?: string
    exchangeType?: 'direct' | 'topic' | 'headers' | 'fanout' | 'match'
    options?: AsertExchangeOptions
  }
  
  interface AsertExchangeOptions {
    durable?: boolean
    internal?: boolean
    autoDelete?: boolean
    alternateExchange?: string
    arguments?: any
  }
  
  interface AssertQueueOptions {
    exclusive?: boolean
    durable?: boolean
    autoDelete?: boolean
    arguments?: any
    messageTtl?: number
    expires?: number
    deadLetterExchange?: string
    deadLetterRoutingKey?: string
    maxLength?: number
    maxPriority?: number
  }
  