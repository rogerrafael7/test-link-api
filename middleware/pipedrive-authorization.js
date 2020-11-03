const lib = require('pipedrive')
const oAuthManager = lib.OAuthManager

lib.Configuration.apiToken = process.env.PIPEDRIVE_API_TOKEN
lib.Configuration.oAuthClientId = process.env.PIPEDRIVE_CLIENT_ID // OAuth 2 Client ID
lib.Configuration.oAuthClientSecret = process.env.PIPEDRIVE_CLIENT_SECRET // OAuth 2 Client Secret
lib.Configuration.oAuthRedirectUri = '/auth/pipedrive/callback' // OAuth

module.exports = async (appServer) => {
  appServer.get('/auth_user', async (req, res) => {
    const user = await lib.UsersController.getCurrentUserData()
    res.send(user)
  })

  appServer.get('/auth/pipedrive/callback', async (req, res, next) => {
    console.log('oAuthToken', lib.Configuration.oAuthToken)
    try {
      if (req.query.error) {
        throw new Error(req.query.error)
      }
      const authCode = req.query.code
      await oAuthManager.authorize(authCode)
      console.log('lib.Configuration.oAuthToken', lib.Configuration.oAuthToken)
      req.session.token = lib.Configuration.oAuthToken
      res.redirect('/')
    } catch (error) {
      console.error(error)
      res.error(error)
    }
  })

  return async (req, res, next) => {
    try {
      console.log('req.session', req.session.token)
      if (req.session.token !== null && req.session.token !== undefined) {
        // token is already set in the session
        // now make API calls as required
        // client will automatically refresh the token when it expires and call the token update callback
        // const user = await lib.UsersController.getCurrentUserData()
        next()
        console.log('123')
      } else {
        const authUrl = oAuthManager.buildAuthorizationUrl()
        console.log(authUrl)
        res.redirect(authUrl)
      }
    } catch (error) {
      res.error(error)
    }
  }
}
