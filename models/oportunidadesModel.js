const connection = require('./index')
const { Schema } = require('mongoose')

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
    enum: ['ganho', 'perdido']
  },
  modified_on: {
    type: Date,
    default: Date.now
  }
}))
module.exports = Oportunidades
