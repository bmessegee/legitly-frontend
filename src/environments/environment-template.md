# Environment Configuration Template

This document shows how to configure the environment files for different deployment environments.

## Environment Variables for OIDC Configuration

The following OIDC configuration values can be set via environment variables or parameter store:

### Development Environment (`environment.ts`)
```typescript
auth: {
  authority: process.env['NG_APP_AUTH_AUTHORITY'] || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_sHoq3Mg11',
  clientId: process.env['NG_APP_AUTH_CLIENT_ID'] || '7f4mcdmoa5okt72lcjpk8s77tk',
  scope: process.env['NG_APP_AUTH_SCOPE'] || 'aws.cognito.signin.user.admin email openid phone profile',
  responseType: process.env['NG_APP_AUTH_RESPONSE_TYPE'] || 'code',
  silentRenew: process.env['NG_APP_AUTH_SILENT_RENEW'] === 'true' || true,
  useRefreshToken: process.env['NG_APP_AUTH_USE_REFRESH_TOKEN'] === 'true' || true,
  renewTimeBeforeTokenExpiresInSeconds: parseInt(process.env['NG_APP_AUTH_RENEW_TIME'] || '30'),
  autoUserInfo: process.env['NG_APP_AUTH_AUTO_USER_INFO'] === 'true' || false
}
```

### Production Environment (`environment.prod.ts`)
```typescript
auth: {
  authority: process.env['NG_APP_AUTH_AUTHORITY'] || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_sHoq3Mg11',
  clientId: process.env['NG_APP_AUTH_CLIENT_ID'] || 'production-client-id',
  scope: process.env['NG_APP_AUTH_SCOPE'] || 'aws.cognito.signin.user.admin email openid phone profile',
  responseType: process.env['NG_APP_AUTH_RESPONSE_TYPE'] || 'code',
  silentRenew: process.env['NG_APP_AUTH_SILENT_RENEW'] === 'true' || true,
  useRefreshToken: process.env['NG_APP_AUTH_USE_REFRESH_TOKEN'] === 'true' || true,
  renewTimeBeforeTokenExpiresInSeconds: parseInt(process.env['NG_APP_AUTH_RENEW_TIME'] || '30'),
  autoUserInfo: process.env['NG_APP_AUTH_AUTO_USER_INFO'] === 'true' || false
}
```

## Parameter Store Integration

For AWS deployment, you can fetch these values from Parameter Store and set them as environment variables:

### Required Parameters in Parameter Store:
- `/legitly/auth/authority`
- `/legitly/auth/client-id`
- `/legitly/auth/scope`
- `/legitly/auth/response-type`
- `/legitly/auth/silent-renew`
- `/legitly/auth/use-refresh-token`
- `/legitly/auth/renew-time`
- `/legitly/auth/auto-user-info`

### Build-time Environment Variable Substitution

For Angular applications, environment variables need to be substituted at build time. You can:

1. Use a pre-build script to fetch from Parameter Store
2. Use CDK/CloudFormation to inject values during deployment
3. Use a build-time replacement script

Example build script (`scripts/build-with-params.sh`):
```bash
#!/bin/bash
# Fetch values from Parameter Store
export NG_APP_AUTH_AUTHORITY=$(aws ssm get-parameter --name "/legitly/auth/authority" --query "Parameter.Value" --output text)
export NG_APP_AUTH_CLIENT_ID=$(aws ssm get-parameter --name "/legitly/auth/client-id" --query "Parameter.Value" --output text)

# Build the application
ng build --configuration=production
```