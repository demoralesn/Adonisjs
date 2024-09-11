import type { HttpContext } from '@adonisjs/core/http'
import { firmaDocValidator, showDocumentoValidator } from '#validators/firma_doc_validator'
import { DgdRequest } from '#types/dgd_request_types'
import { EstadoResponseType, FirmaResponseType } from '../helpers/default_types.js'
import DgdService from '#services/dgd_service'
import RequestDgdHelper from '#helpers/request_dgd_helper'
import { editPDF } from '#helpers/pdf_helper'
import env from '#start/env'
import DocumentoService from '#services/documento_service'
import { crearPdfFromBase64, SubirPdfBlobStorage } from '#services/file_service'
import RabbitMQService from '#services/rabbitmq_service'
import { getRedisKeys, getValue } from '#services/redis_service'
//const { SagRegistroLog: sagLog } = require('@sag/registrologs')

export default class FirmaDocController {

  async index(ctx: HttpContext) {

    const response: EstadoResponseType = {
      success: false,
      message: '',
      data: null
    }

    try {
      //const qs = ctx.request.qs()

      //const redisKey = Object.keys(qs).length === 0 ? getRedisKeys.documentos.index() : getRedisKeys.documentos.index(qs)

      //const redisValue = await getValue(redisKey)

      //if (redisValue.success) {
      //  response.success = true
      //  response.data = JSON.parse(redisValue.data)
      //  ctx.response.status(200)
      //  return response
      //}

      response.data = await DocumentoService.index()
      response.success = true
      ctx.response.status(200)

      //await setValue(redisKey, JSON.stringify(response.data))

    } catch (error) {
      if (error.messages) {
        response.error = error.messages
        ctx.response.status(400)
      } else {
        response.error = 'Error al obtener los registros ' + error.message
        response.message = "No se pudieron obtener los documentos"
        ctx.response.status(500)
      }
    }

    return response
  }

  async show(ctx: HttpContext) {

    const response: EstadoResponseType = {
      data: null
    }

    const payload = await ctx.request.validateUsing(showDocumentoValidator)

    try {

      const redisKey = getRedisKeys.usuarios.show(payload.params.uuid)

      //sagLog.log(`Retona valor desde la key ${redisKey} en redis`)

      //const redisValue = await getValue(redisKey)

      await getValue(redisKey)

      //if (redisValue.success) {
        //response.success = true
        //response.data = JSON.parse(redisValue.data)
      //  response.data = await DocumentoService.show(payload)
      //  ctx.response.status(200)
      //  return response
      //}

      const documento = await DocumentoService.show(payload)

      RabbitMQService.publishMessage({
        message: JSON.stringify(documento),
        exchangeName: 'documentos',
        queue: 'documentos',
      })

      response.data = documento
      ctx.response.status(200)

      //await setValue(redisKey, JSON.stringify(response.data))

    } catch (error) {
      if (error.messages) {
        response.error = error.messages
        ctx.response.status(400)
      } else {
        response.error = 'Error al obtener los registros ' + error.message
        ctx.response.status(500)
      }
    }

    return response
  }

  async store(ctx: HttpContext) {
    const response: FirmaResponseType = {
      data: {
        uuid: null,
      }
    }

    try {

      const payload = await ctx.request.validateUsing(firmaDocValidator)
      const doc_tipo_firma: string = "Desatendido"
      const doc_description: string = "PDF Firmado"
      const dgd_api_token_key = env.get('DGD_API_TOKEN_KEY')
      const dgd_token = env.get('DGD_TOKEN')
      const doc_checksum = env.get('DOC_CHECKSUM')

      const layoutXML = RequestDgdHelper.generateLayoutXML(payload.elementos);

      const editedPdfBase64 = await editPDF(payload.pdf, payload.elementos)

      const dgdRequest: Partial<DgdRequest> = {
        api_token_key: dgd_api_token_key,
        token: dgd_token,
        files: [
          {
            'content-type': 'application/pdf',
            content: editedPdfBase64,
            checksum: doc_checksum,
            layout: layoutXML,
            description: doc_description
          }
        ]
      }

      const dgd_response = await DgdService.firmarDocumento(dgdRequest as DgdRequest, payload.rut.toString(), doc_tipo_firma)

      const documento = await DocumentoService.store(payload, dgd_response)

      const filePath = await crearPdfFromBase64(dgd_response.files[0].content)

      const url_publicacion = await SubirPdfBlobStorage(filePath, documento.uuid)

      await DocumentoService.updateUrlPublicacion(documento.uuid, url_publicacion)
      await DocumentoService.updateEstadoDocumento(documento.uuid, 'completado')

      response.data.uuid = documento.uuid

      ctx.response.status(201)

    } catch (error) {
      if (error.messages) {
        response.error = error.messages
        ctx.response.status(400)
      } else {
        response.error = 'Error al intentar firmar el documento ' + error.message
        ctx.response.status(500)
      }
    }

    return response
  }

  async downloadDoc(ctx: HttpContext) {

    try {
      const payload = await ctx.request.validateUsing(showDocumentoValidator)

      const documento = await DocumentoService.show(payload)

      if (documento) {
        ctx.response.attachment(documento?.url_publicacion)

        await DocumentoService.updateDescargaDocumento(documento.uuid)
      } else {
        ctx.response.status(404)
      }

    }
    catch (error) {
      ctx.response.status(500)
    }
  }

  async storeIntegrado(ctx: HttpContext) {
    const response: EstadoResponseType = {
      success: false,
      message: '',
      data: null
    }

    try {

      const payload = await ctx.request.validateUsing(firmaDocValidator)
      const doc_tipo_firma: string = "Desatendido"
      const doc_description: string = "PDF Firmado"
      const dgd_api_token_key = env.get('DGD_API_TOKEN_KEY')
      const dgd_token = env.get('DGD_TOKEN')
      const doc_checksum = env.get('DOC_CHECKSUM')

      const layoutXML = RequestDgdHelper.generateLayoutXML(payload.elementos);

      const editedPdfBase64 = await editPDF(payload.pdf, payload.elementos)

      const dgdRequest: Partial<DgdRequest> = {
        api_token_key: dgd_api_token_key,
        token: dgd_token,
        files: [
          {
            'content-type': 'application/pdf',
            content: editedPdfBase64,
            checksum: doc_checksum,
            layout: layoutXML,
            description: doc_description
          }
        ]
      }

      const respFirmar = await DgdService.firmarDocumento(dgdRequest as DgdRequest, payload.rut.toString(), doc_tipo_firma)

      //await DocumentoService.store(payload, respFirmar)

      response.success = true
      response.data = respFirmar
      response.message = 'Documento firmado correctamente'

      ctx.response.status(201)

    } catch (error) {
      if (error.messages) {
        response.error = error.messages
        ctx.response.status(400)
      } else {
        response.error = 'Error al intentar firmar el documento ' + error.message
        response.message = 'El documento no pudo ser firmado'
        ctx.response.status(500)
      }
    }

    return response
  }
}