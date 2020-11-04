const OportunidadesService = require('../service/OportunidadesService')

module.exports = {
  basepath: '/oportunidades',
  routes: [
    {
      path: '/',
      method: 'get',
      handler: async (req, res) => {
        return new OportunidadesService(req, res).getOportunidades()
      }
    },
    {
      path: '/origin',
      method: 'get',
      handler: async (req, res) => {
        return new OportunidadesService(req, res).getOportunidadesFromOrigin()
      }
    },
    {
      path: '/sync',
      method: 'get',
      handler: async (req, res) => {
        return new OportunidadesService(req, res).syncOportunidades()
      }
    },
    {
      path: '/kpis',
      method: 'get',
      handler: async (req, res) => {
        return new OportunidadesService(req, res).getKpis()
      }
    },
    {
      path: '/',
      method: 'post',
      handler: async (req, res) => {
        return new OportunidadesService(req, res).saveOportunidade(req.body.current)
      }
    }
  ]
}
