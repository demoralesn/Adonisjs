import JwtService from '#services/jwt_service'
import { DgdRequest } from '#types/dgd_request_types'
import axios, { AxiosError } from 'axios'
import env from '#start/env'

// Clase personalizada para manejar errores específicos del servicio DGD
export class DgdServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'DgdServiceError'
  }
}

export default class DgdService {
  // URL de la API obtenida de las variables de entorno
  private static readonly API_URL = env.get('DGD_API_URL')

  /**
   * Método principal para firmar un documento
   * @param payload Datos del documento a firmar
   * @param rut RUT del firmante
   * @param purpose Propósito de la firma
   * @returns Respuesta de la API de firma
   */
  public static async firmarDocumento(payload: DgdRequest, rut: string, purpose: string): Promise<any> {
    try {
      // Genera el token JWT
      const token = await this.generateToken(rut, purpose)
      // Añade el token al payload
      payload.token = token
      // Realiza la llamada a la API
      const response = await this.makeApiCall(payload)
      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  /**
   * Genera un token JWT para la autenticación
   * @param rut RUT del firmante
   * @param purpose Propósito de la firma
   * @returns Token JWT generado
   */
  private static async generateToken(rut: string, purpose: string): Promise<string> {
    try {
      return await JwtService.generateToken(rut, purpose)
    } catch (error) {
      throw new DgdServiceError('Error generando el token JWT', 500)
    }
  }

  /**
   * Realiza la llamada a la API de firma
   * @param payload Datos del documento a firmar, incluyendo el token
   * @returns Respuesta de la API
   */
  private static async makeApiCall(payload: DgdRequest): Promise<any> {
    try {
      return await axios.post(
        this.API_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        throw new DgdServiceError(
          `Error en la llamada a la API: ${axiosError.message}`,
          axiosError.response?.status
        )
      }
      throw new DgdServiceError('Error desconocido en la llamada a la API', 500)
    }
  }

  /**
   * Maneja los errores del servicio
   * @param error Error capturado
   * @throws DgdServiceError
   */
  private static handleError(error: unknown): never {
    if (error instanceof DgdServiceError) {
      throw error
    }
    throw new DgdServiceError('Error interno del servicio', 500)
  }
}