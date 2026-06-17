# TaskFlow Pro Backend Deployment

## Render Setup

1. Create a new `Web Service` in Render.
2. Point it to the repository and set the root directory to `backend`.
3. Use the commands below.
4. Add the environment variables listed in this file.
5. Deploy and verify the `/health` endpoint after the first successful boot.

## Render Commands

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

## Required Environment Variables

```text
NODE_ENV=production
PORT=10000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<your-frontend-web-url>
ADMIN_DASHBOARD_URL=<your-admin-dashboard-url>
ANDROID_APP_URL=taskflowpro://auth
CORS_ORIGIN=<comma-separated-allowed-origins>
EMAIL_VERIFICATION_REQUIRED=true
MAIL_FROM=TaskFlow Pro <no-reply@taskflowpro.com>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

## Email Environment Variables

Set these for production email verification and password-reset delivery:

```text
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password-or-api-key>
```

If SMTP values are left empty, the backend will still generate tokens, but email links will only be written to server logs. That is useful in development and not suitable for production.

## MongoDB Atlas Setup

1. Use a dedicated Atlas database user with read/write access to the app database.
2. Add Render outbound IPs to Atlas Network Access, or temporarily allow `0.0.0.0/0` while validating the deployment.
3. Set `MONGODB_URI` in Render using the Atlas SRV connection string.
4. Confirm the database name in the URI matches the intended production database.

## CORS Notes

`CORS_ORIGIN` accepts a comma-separated list. Example:

```text
CORS_ORIGIN=https://admin-taskflow-pro.netlify.app,https://taskflow-ltd.netlify.app
```

## Post-Deploy Checks

1. Open `https://<your-render-service>/health`
2. Verify the response shows `"status": "ok"` and `"database": "connected"`
3. Test `POST /api/auth/login`
4. Test a protected route such as `GET /api/auth/me`
5. Test one email flow after SMTP is configured

## Optional Seed

To create the sample accounts after deployment:

```bash
npm run seed:users
```

This creates:

- `test@taskflowpro.com` / `Test@123`
- `admin@taskflowpro.com` / `Admin@123`
