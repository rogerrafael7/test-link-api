const connection = require('./index')
const moment = require('moment')

const Oportunidades = connection.model('Oportunidades', {
  idOrigin: {
    type: String,
    unique: true
  },
  nomeNegocio: String,
  idPedidoCompra: Number,
  valorFinal: Number,
  status: {
    type: String,
    enum: ['ganho', 'perdido']
  },
  dataUltimoEvento: {
    type: String,
    default: () => moment().format('YYYY-MM-DD')
  }
})
module.exports = Oportunidades
