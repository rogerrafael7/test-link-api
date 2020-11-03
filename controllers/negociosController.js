const AbstractController = require('./AbstractController')

class NegociosController extends AbstractController {
  async getNegocios () {
    return {
      a: 123
    }
  }

  async createNegocio () {
    const { body } = this.request
    console.log(body)
  }
}

module.exports = {
  basepath: '/negocios',
  routes: [
    {
      path: '/',
      method: 'get',
      handler: async (req, res) => {
        return new NegociosController(req, res).getNegocios()
      }
    },
    {
      path: '/',
      method: 'post',
      handler: async (req, res) => {
        return new NegociosController(req, res).createNegocio()
      }
    }
  ]
}
