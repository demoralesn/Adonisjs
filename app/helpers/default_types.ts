export type FirmaResponseType = {
  message?: string
  error?: string
  data: {
    uuid: any
  }
}

export type ResponseType = {
  success?: boolean
  message?: string
  error?: string
  httpCode?: number
  data: any
}

export type EstadoResponseType = {
  success?: boolean
  message?: string
  error?: string
  httpCode?: number
  data: any
}

export type FieldsValues = {
  [key: string]: string
}

export type HealthCheck = {
  status: string
  uptime: number
  timestamp: number
  message?: string
}