import { ApplicationCredentialsManager } from '@esri/arcgis-rest-request'

export default async function getToken({ clientId, clientSecret }) {
  const appManager = ApplicationCredentialsManager.fromCredentials({
    clientId,
    clientSecret
  })

  const token = await appManager.getToken() // or refreshToken()

  return token
}