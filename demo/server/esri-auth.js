const { ApplicationCredentialsManager } = require('@esri/arcgis-rest-request')

module.exports = async ({ clientId, clientSecret }) => {
  const appManager = ApplicationCredentialsManager.fromCredentials({
    clientId,
    clientSecret
  })

  const token = await appManager.getToken() // refreshToken()

  return token
}
