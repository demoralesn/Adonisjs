import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class TimestampMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Agrega el timestamp al contexto
    ctx.request.updateBody({
      ...ctx.request.body(),
      timestamp: new Date().toISOString()
    })

    // Llama al siguiente middleware/controlador
    await next()
  }
}