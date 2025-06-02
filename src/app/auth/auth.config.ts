// src/app/auth/auth.config.ts
import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_fpSWjGp3X',
    clientId: '7sol69mkggitf6rfkamoq0ujns',
    redirectUrl: window.location.origin + "/login",
    postLogoutRedirectUri: window.location.origin + "/login",
    scope: 'aws.cognito.signin.user.admin email openid phone profile',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    autoUserInfo: false,
  },
};