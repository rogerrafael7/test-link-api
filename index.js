const path = require('path')
require('dotenv').config({
  // path: process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '.env-development') : undefined, // usar esta lógica apenas se for considerar o NODE_ENV numa implantação
  path: path.resolve(__dirname, '.env-development')
})

require('./globals/CustomException')

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const app = express()
const responser = require('./middleware/responser')
const pipedriveAuthorization = require('./middleware/pipedrive-authorization')
const controllers = require('./controllers')
const PORT = process.env.PORT

const init = async () => {
  app.use(bodyParser.json())
  app.use(cookieParser())
  app.use(responser)
  app.use((await pipedriveAuthorization(app)))

  await controllers.init(app)

  app.listen(PORT, () => {
    console.log(`Server is running! Port: ${PORT}`)
  })
}

;(async () => {
  await init()
})()
