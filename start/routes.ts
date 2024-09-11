/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.group(() => {
  router.group(() => {
      router.get('/',         '#controllers/firma_doc_controller.index')
      router.get('/:uuid',    '#controllers/firma_doc_controller.show')
      router.get('/:uuid/pdf-firmado',    '#controllers/firma_doc_controller.downloadDoc')
      router.post('/',        '#controllers/firma_doc_controller.store')
      router.post('/firma-integrada',        '#controllers/firma_doc_controller.storeIntegrado')
      router.put('/:uuid',    '#controllers/firma_doc_controller.update')
      router.delete('/:uuid', '#controllers/firma_doc_controller.destroy')
    }).prefix('documentos')
}).prefix("/api/v1");