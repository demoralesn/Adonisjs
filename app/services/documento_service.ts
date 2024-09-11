import Documento from "#models/documento"
import { firmaDocValidator, showDocumentoValidator } from "#validators/firma_doc_validator"
import { Infer } from "@vinejs/vine/types"
import { DateTime } from "luxon"
import { v4 as uuidv4 } from 'uuid'

export default class DocumentoService {

    static async index() {

        const query = Documento.query()

        let documento

        documento = await query

        return documento
    }

    static async show(payload:Infer<typeof showDocumentoValidator>) {

        const documento = await Documento.query()
            .where('uuid', payload.params.uuid)
            .first()

        return documento
    }

    static async store(payload:Infer<typeof firmaDocValidator>, data:string) {

        let uuid = ''

        do {
            uuid = uuidv4()
        } while (await Documento.query().where('uuid', uuid).first())

        const documento = new Documento()

        documento.uuid = uuid
        documento.token = payload.token
        documento.rut = payload.rut
        documento.estado = "solicitado"
        documento.dgd_response = data

        await documento.save()

        return documento
    }

    static async updateUrlPublicacion(doc_id:string, doc_url:string) {

        const documento = await Documento.query().where('uuid', doc_id).first()

        if (documento) {
            documento.url_publicacion = doc_url
            documento.fecha_publicacion = DateTime.local()

            await documento.save()
        }

        return documento
    }

    static async updateEstadoDocumento(doc_id:string, estado:string) {

        const documento = await Documento.query().where('uuid', doc_id).first()

        if (documento) {
            documento.estado = estado

            await documento.save()
        }

        return documento
    }

    static async updateDescargaDocumento(doc_id:string) {

        const documento = await Documento.query().where('uuid', doc_id).first()

        if (documento) {
            documento.estado = 'descargado'
            documento.fecha_descarga = DateTime.local()
            await documento.save()
        }

        return documento
    }
}