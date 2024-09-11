export interface Elemento {
  nombre: string
  tipo: 'imagen' | 'texto'
  valor: string
  pagina: number
  x: number
  y: number
  w?: number
  font?: string
  size?: number
}

export interface FirmaDocPayload {
  editar: boolean
  rut: number
  token: string
  pdf: string
  elementos: Elemento[]
}