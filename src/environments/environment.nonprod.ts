// Development environment configuration
export const environment = {
  production: false,
  stripe: {
    publishableKey: 'pk_test_51S2INMQalW3lrPD5K9Sv6bKeh5OEZ6FZ13UG9MpynmN69cYAY9PatmQiEEhVQGVocZlo6EpXOIqo4eXM4mpYYTvT00mmBNLi3Y'
  },
  api: {
    baseUrl: 'https://api.legitly-dev.com/'
  },
  auth: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_6jSauNDLm',
    clientId: '5au1hi0fruvur8vpmpttiqlb15',
    scope: 'aws.cognito.signin.user.admin email openid phone profile',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    autoUserInfo: false,
    logoutUrl: "https://legitly-dev.auth.us-east-1.amazoncognito.com/logout?client_id=5au1hi0fruvur8vpmpttiqlb15&logout_uri=https://app.legitly-dev.com/login"
  }
};