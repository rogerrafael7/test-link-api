const ClientOAuth2 = require('client-oauth2')

const pipedriveOAuth = new ClientOAuth2({
  clientId: process.env.PIPEDRIVE_CLIENT_ID,
  // clientSecret: '123',
  accessTokenUri: ' https://oauth.pipedrive.com/oauth/token',
  authorizationUri: 'https://oauth.pipedrive.com/oauth/authorize',
  redirectUri: `http://${process.env.HOST}:${process.env.PORT}/auth/pipedrive/callback`
  // scopes: ['notifications', 'gist']
})

const requestHelper = {
  _started: false,
  get (url, params, options) {

  },
  post (url, params, options) {

  },
  getPipeDrive (uri, params, options) {

  },
  postPipeDrive (uri, params, options) {

  }
}

module.exports = {
  init: async (appServer) => {
    if (requestHelper._started) {
      return requestHelper
    }
    requestHelper._started = true
    appServer.get('/auth/pipedrive/callback', async (req, res) => {
      console.log(123)
      const data = await pipedriveOAuth.code.getToken(req.originalUrl)
      console.log('accessToken: ' + data.accessToken, 'code: ' + data.code)
      return res.send(data.accessToken)
    })
    return requestHelper
  }
}
