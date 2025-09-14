// Production environment configuration
export const environment = {
  production: true,
  stripe: {
    publishableKey: 'pk_test_51S2INMQalW3lrPD5K9Sv6bKeh5OEZ6FZ13UG9MpynmN69cYAY9PatmQiEEhVQGVocZlo6EpXOIqo4eXM4mpYYTvT00mmBNLi3Y'
  },
  api: {
    baseUrl: 'https://sehplat8x2.execute-api.us-east-1.amazonaws.com/prod/'
  },
  auth: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_sHoq3Mg11',
    clientId: '7f4mcdmoa5okt72lcjpk8s77tk',
    scope: 'aws.cognito.signin.user.admin email openid phone profile',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    autoUserInfo: false
  }
};