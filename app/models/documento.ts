import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { databaseDateToHumanDate } from '../helpers/date_helper.js'

export default class Documento extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare uuid: string

  @column()
  declare token: string

  @column()
  declare rut: number

  @column()
  declare estado: string

  @column()
  declare error: string

  @column.dateTime( { serializeAs: 'fecha_edicion' } )
  declare fecha_edicion: DateTime

  @column.dateTime({ 
    autoCreate: true, 
    serialize: (value: DateTime ) => {
      return databaseDateToHumanDate( value.toString() )
    },
    serializeAs: 'fecha_firma'
  })
  declare fecha_firma: DateTime

  @column.dateTime({ 
    autoCreate: true, 
    serialize: (value: DateTime ) => {
      return databaseDateToHumanDate( value.toString() )
    },
    serializeAs: 'fecha_publicacion'
  })
  declare fecha_publicacion: DateTime

  @column( { serializeAs: null } )
  declare dgd_response: string

  @column( {serializeAs: 'url_publicacion'} )
  declare url_publicacion: string

  @column.dateTime( { serializeAs: 'fecha_notificacion' } )
  declare fecha_notificacion: DateTime

  @column.dateTime( { serializeAs: 'fecha_descarga' } )
  declare fecha_descarga: DateTime

  @column.dateTime({ 
    autoCreate: true, 
    serialize: (value: DateTime ) => {
      return databaseDateToHumanDate( value.toString() )
    },
    serializeAs: 'created_at'
  })
  declare created_at: DateTime

  @column.dateTime({ 
    autoCreate: true, 
    autoUpdate: true,
    serialize: (value: DateTime ) => {
      return databaseDateToHumanDate( value.toString() )
    },
    serializeAs: 'updated_at'
  })
  declare updated_at: DateTime
}