// src/app/auth/auth.config.ts
import { PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.auth.authority,
    clientId: environment.auth.clientId,
    redirectUrl: window.location.origin + "/login",
    postLogoutRedirectUri: window.location.origin + "/login",
    scope: environment.auth.scope,
    responseType: environment.auth.responseType,
    silentRenew: environment.auth.silentRenew,
    useRefreshToken: environment.auth.useRefreshToken,
    renewTimeBeforeTokenExpiresInSeconds: environment.auth.renewTimeBeforeTokenExpiresInSeconds,
    autoUserInfo: environment.auth.autoUserInfo,
  },
};