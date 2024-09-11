import vine from '@vinejs/vine'

export const firmaDocValidator = vine.compile(
  vine.object({
    editar: vine.boolean(),
    rut: vine.number().withoutDecimals().positive(),
    token: vine.string().trim().minLength(1),
    pdf: vine.string().trim().minLength(1),
    elementos: vine.array(
      vine.object({
        nombre: vine.string().trim().minLength(1),
        tipo: vine.enum(['imagen', 'texto', 'qr']),
        valor: vine.string(),
        pagina: vine.number().withoutDecimals().positive(),
        x: vine.number(),
        y: vine.number(),
        w: vine.number().optional(),
        font: vine.string().optional(),
        size: vine.number().optional()
      })
    ).minLength(1)
  })
)

export const showDocumentoValidator = vine.compile(
  vine.object({
      params: vine.object({
          uuid: vine.string().uuid()
      })
  })
)