# TaskFlow Pro Backend

Production-ready Node.js, Express, and MongoDB Atlas API for TaskFlow Pro.

## Stack

- Node.js 18+
- Express
- MongoDB Atlas with Mongoose
- JWT authentication
- bcrypt password hashing
- Nodemailer SMTP email delivery
- express-validator input validation
- helmet, CORS, compression, and rate limiting

## Quick Start

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set `MONGODB_URI` to your MongoDB Atlas connection string and replace `JWT_SECRET` with a long random secret before running outside local development.

## Scripts

```bash
npm start
npm run dev
npm run check
```

## Project Structure

```text
src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  validators/
docs/
  API.md
```

## Client Compatibility

The API returns Mongo data with client-friendly fields:

- Users include `id` and `uid`.
- Tasks include `id`, `userId`, and millisecond `createdAt`, `updatedAt`, `dueDate`.
- JWT responses include both `accessToken` and `token`.

This keeps integration simple for both the Android app and `frontend-web`, which currently use Firebase-style `uid`, task `id`, and millisecond timestamps.

## Environment

See [.env.example](.env.example) for all supported variables.

`EMAIL_VERIFICATION_REQUIRED=false` allows newly registered users to log in while still supporting verification. Set it to `true` in stricter production deployments.

## API Docs

Full endpoint documentation lives in [docs/API.md](docs/API.md).
