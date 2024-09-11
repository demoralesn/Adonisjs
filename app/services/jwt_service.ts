import jwt, { Algorithm } from 'jsonwebtoken'
import env from '#start/env'
import { format, toZonedTime } from 'date-fns-tz'

// Clase de error personalizada para JwtService
class JwtServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JwtServiceError'
  }
}
export default class JwtService {

  private static readonly TIME_ZONE = env.get('JWT_TIME_ZONE', 'America/Santiago')
  private static readonly SECRET_KEY = env.get('JWT_SECRET_KEY')
  private static readonly EXPIRES_IN = env.get('JWT_EXPIRES_IN', '30m')
  private static readonly ALGORITHM: Algorithm | undefined = env.get('JWT_ALGORITHM', 'HS256') as Algorithm | undefined;
  private static readonly ENTITY = env.get('JWT_ENTITY', 'Servicio Agrícola y Ganadero')

  /**
   * Genera un token JWT
   * @param run RUN del usuario
   * @param purpose Propósito del token
   * @returns Token JWT generado
   */
  public static generateToken(run: string, purpose: string): string {

    try {
      const now = new Date()
      const expirationDate = this.calculateExpirationDate(now)

      const payload = this.createPayload(run, purpose, expirationDate)
      const options = this.createSignOptions()

      this.logTokenInfo(now, expirationDate)

      return jwt.sign(payload, this.SECRET_KEY, options)
    } catch (error) {
      throw new JwtServiceError(`Error al generar el token JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Calcula la fecha de expiración del token
   * @param now Fecha actual
   * @returns Fecha de expiración
   */
  private static calculateExpirationDate(now: Date): Date {
    return new Date(now.getTime() + 30 * 60 * 1000) // 30 minutos
  }

  /**
   * Crea el payload para el token JWT
   * @param run RUN del usuario
   * @param purpose Propósito del token
   * @param expirationDate Fecha de expiración
   * @returns Payload del token
   */
  private static createPayload(run: string, purpose: string, expirationDate: Date) {
    return {
      entity: this.ENTITY,
      run,
      expiration: this.toLocalISOString(expirationDate),
      purpose
    }
  }

  /**
  * Crea las opciones de firma para el token JWT
  * @returns Opciones de firma
  */
  private static createSignOptions(): jwt.SignOptions {
    return {
      expiresIn: this.EXPIRES_IN,
      algorithm: this.ALGORITHM
    }
  }

  /**
  * Registra información sobre el token generado
  * @param now Fecha actual
  * @param expirationDate Fecha de expiración
  */
  private static logTokenInfo(now: Date, expirationDate: Date): void {
    console.log('Hora actual:', this.toLocalISOString(now))
    console.log('Hora de expiración:', this.toLocalISOString(expirationDate))
  }

  /**
 * Convierte una fecha a formato ISO string en la zona horaria local
 * @param date Fecha a convertir
 * @returns Fecha en formato ISO string en zona horaria local
 */
  public static toLocalISOString(date: Date): string {
    const zonedDate = toZonedTime(date, this.TIME_ZONE)
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone: this.TIME_ZONE })
  }
}