const connection = require('./index')

const Negocios = connection.model('Negocios', {
  name: String
})
module.exports = Negocios
