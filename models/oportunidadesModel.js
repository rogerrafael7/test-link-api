const connection = require('./index')

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
    type: Date,
    default: Date.now
  }
})
module.exports = Oportunidades
