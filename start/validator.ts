import vine, { SimpleMessagesProvider } from "@vinejs/vine";

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'El campo {{ field }} es obligatorio',
  'string.minLength': 'El campo {{ field }} debe tener al menos {{ options.minLength }} caracteres',
  'string.maxLength': 'El campo {{ field }} debe tener como máximo {{ options.maxLength }} caracteres',
  'string.email': 'El campo {{ field }} debe ser una dirección de correo electrónico válida'
});