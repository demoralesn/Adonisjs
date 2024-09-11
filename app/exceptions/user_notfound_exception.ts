import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'

export default class UserNotFoundException extends ExceptionHandler {
  public async handle(ctx: HttpContext) {
    ctx.response.status(404).json({
      error: 'User not found'
    })
  }
}
