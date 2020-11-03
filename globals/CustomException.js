
global.CustomException = class CustomException extends Error {
  constructor (message, status = 400, type = 'DEFAULT_EXCEPTION') {
    super(message)
    this.type = type
    this.status = status
  }
}
module.exports = CustomException
