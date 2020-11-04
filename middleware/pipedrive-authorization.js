const lib = require('pipedrive')

lib.Configuration.apiToken = process.env.PIPEDRIVE_API_TOKEN

module.exports = async (appServer) => {
  appServer.get('/currentUserData', async (req, res) => {
    res.send(req.pipedriveUser)
  })

  return async (req, res, next) => {
    req.pipedriveUser = (await lib.UsersController.getCurrentUserData()).data
    next()
  }
}
