const path = require('path')
require('dotenv').config({
  // path: process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '.env-development') : undefined, // usar esta lógica apenas se for considerar o NODE_ENV numa implantação
  path: path.resolve(__dirname, '.env-development')
})

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const responser = require('./middleware/responser')
const controllers = require('./controllers')
const requestHelper = require('./helper/request')
const PORT = process.env.PORT

const init = async () => {
  app.use(bodyParser.json())
  app.use(responser)

  await controllers.init(app)
  await requestHelper.init(app)

  app.listen(PORT, () => {
    console.log(`Server is running! Port: ${PORT}`)
  })
}

;(async () => {
  await init()
})()
