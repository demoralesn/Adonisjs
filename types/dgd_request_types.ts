export interface File {
  'content-type': string
  content: string
  description?: string
  checksum?: string
  layout?: string
}

export interface DgdRequest {
  api_token_key: string
  token: string
  files?: File[]
}