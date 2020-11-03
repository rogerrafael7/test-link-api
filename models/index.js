const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_SRV, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = mongoose
