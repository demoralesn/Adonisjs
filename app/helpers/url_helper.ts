import env from "#start/env"

export const getUrlBlobStorage = (uuid: string): string => {
    const containerName = env.get('BLOB_STORAGE_CONTAINER_NAME')
    const accountName = env.get('BLOB_STORAGE_ACCOUNT_NAME')

    return `https://${accountName}.blob.core.windows.net/${containerName}/${uuid}`
}