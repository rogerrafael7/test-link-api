const fs = require('fs')
const express = require('express')
const { Router } = express

// registra dinamicamente todos as rotas de todos os Controllers
const controllersModule = {
  init: async (appServer) => {
    const controllersFiles = fs.readdirSync(__dirname)
      .filter((filename) =>
        !filename.match(/^Abstract/i) &&
        filename.match(/Controller.js$/i)
      )

    for (const filename of controllersFiles) {
      const controllerConfig = require(`./${filename}`)
      const router = Router()
      for (const routeConfig of controllerConfig.routes) {
        router[routeConfig.method](routeConfig.path, async (req, res) => {
          try {
            const result = await routeConfig.handler(req, res)
            res.success(result)
          } catch (error) {
            res.error(error)
          }
        })
      }
      appServer.use(controllerConfig.basepath, router)
    }
  }
}

module.exports = controllersModule
