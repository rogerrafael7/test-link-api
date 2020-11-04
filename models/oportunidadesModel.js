const connection = require('./index')

const Oportunidades = connection.model('Oportunidades', {
  idOrigin: {
    type: String,
    unique: true
  },
  nomeNegocio: String,
  valorFinal: Number,
  status: {
    type: String,
    enum: ['ganho', 'perdido']
  },
  dataUltimoEvento: {
    type: Date,
    default: () => new Date()
  }
})
module.exports = Oportunidades