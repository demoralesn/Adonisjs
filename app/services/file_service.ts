import fs from 'fs/promises'
//import path from 'path';
//import { fileURLToPath } from 'url';
import { BlobServiceClient } from '@azure/storage-blob'
import env from '#start/env';
import { getUrlBlobStorage } from '#helpers/url_helper';

//const __filename = fileURLToPath(import.meta.url)
//const __dirname = path.dirname(__filename)
const BLOB_STORAGE_CONNECTION_STRING = env.get('BLOB_STORAGE_CONNECTION_STRING')
const BLOB_STORAGE_CONTAINER_NAME = env.get('BLOB_STORAGE_CONTAINER_NAME')

export async function crearPdfFromBase64(base64String: string) {

  const fileName = `documento_firmado_${Date.now()}.pdf`

  //const filePathPDF = path.join(__dirname, '..', 'tmp', fileName);

  const filePathPDF = '/tmp/' + fileName

  const pdfBuffer = Buffer.from(base64String, 'base64')

  await fs.writeFile(filePathPDF, pdfBuffer);

  return filePathPDF
}

export async function SubirPdfBlobStorage(filePath: string, doc_id:string) {

  const contentType = 'application/pdf'

  const blobServiceClient = BlobServiceClient.fromConnectionString(BLOB_STORAGE_CONNECTION_STRING)
  const containerName = BLOB_STORAGE_CONTAINER_NAME
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const urlAzure = getUrlBlobStorage(doc_id)

  if (!containerClient.exists()) {
    await containerClient.create()
  }

  const blockBlobClient = containerClient.getBlockBlobClient(doc_id)

  const options = {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  }

  await blockBlobClient.uploadFile(filePath, options)

  return urlAzure
}
