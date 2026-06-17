# Cognito Setup

Diagramify Mini uses Amazon Cognito User Pool authentication in `ap-south-1`.

## Region

```text
ap-south-1
```

## User Pool Authentication

Use a Cognito User Pool with:

- Email/password authentication.
- Self-registration enabled.
- Email verification code flow enabled.
- SMS MFA disabled.
- Hosted UI optional, but not required for the current app.

## App Client For SPA

Create an app client for the React single-page app:

- Client secret disabled.
- Username/password authentication enabled.
- Refresh token support enabled.
- Callback/logout URLs configured only if Hosted UI is introduced later.

Do not use a client secret in a browser app. SPA source code is public to users, so secrets cannot be protected there.

## Required Vite Environment Variables

Create `.env.local` locally:

```bash
VITE_COGNITO_USER_POOL_ID=ap-south-1_example
VITE_COGNITO_CLIENT_ID=exampleclientid
VITE_COGNITO_REGION=ap-south-1
```

These variables are read by Vite at build time and are safe to expose as public client configuration. They are identifiers, not AWS credentials.

Do not commit `.env.local`.
