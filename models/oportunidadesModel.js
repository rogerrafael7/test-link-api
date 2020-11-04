const connection = require('./index')
const { Schema } = require('mongoose')
const moment = require('moment')

const Oportunidades = connection.model('Oportunidades', new Schema({
  idOrigin: {
    type: String,
    unique: true
  },
  nomeNegocio: String,
  idPedidoCompra: Number,
  valorFinal: Number,
  status: {
    type: String,
    enum: ['ganho', 'perdido', 'reaberto', 'removido']
  },
  modified_on: {
    type: String,
    default: () => moment().format('YYYY-MM-DD')
  }
}))
module.exports = Oportunidades
