# Security Course Server

Express + TypeScript API for the Node.js security course demo. It provides registration, login, cookie-based JWT authentication, CSRF protection for state-changing auth routes, simple role-based access control, rate limiting, and MongoDB persistence through Mongoose.

## What This API Does

- Registers users with hashed passwords.
- Logs users in and sets access, refresh, and CSRF cookies.
- Returns the authenticated user's profile.
- Refreshes auth cookies when a valid refresh token and CSRF token are provided.
- Logs users out by clearing auth cookies.
- Provides an admin-only users list endpoint.
- Limits API and auth request rates.
- Locks accounts temporarily after repeated failed login attempts.

## Tech Stack

- Node.js 22
- Express
- TypeScript
- MongoDB + Mongoose
- bcrypt
- JSON Web Tokens
- cookie-parser
- Zod
- Helmet
- express-rate-limit
- CORS

## Project Structure

```text
server/
  src/
    server.ts           App setup, middleware, routes, MongoDB connection
    routes/auth.ts      Auth, refresh, logout, and user-list routes
    middleware/auth.ts  Access-token auth and role checks
    models/User.ts      Mongoose user model
    utils/
      cookie.ts         Auth cookie and CSRF helpers
      helpers.ts        Validation and failed-login lockout helpers
      jwt.ts            JWT and CSRF token creation
      schema.ts         Zod validation schemas
      types.ts          Shared request/token types
  Dockerfile            Production build and start image
```

## Environment Variables

Create or update `server/.env` for local development:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/security_course
CLIENT_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
```

The root `docker-compose.yaml` passes the same values from the root `.env` file into the server container.

Important: do not commit real database credentials or production JWT secrets. If any real secrets have already been committed, rotate them.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The API listens on `http://localhost:4000` by default.

## Available Scripts

```bash
npm run dev    # Start with tsx watch
npm run build  # Compile TypeScript to dist/
npm start      # Run the compiled server from dist/server.js
```

## API Endpoints

Base path: `/api`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | None | Health check |
| `POST` | `/auth/register` | None | Create a user |
| `POST` | `/auth/login` | None | Validate credentials and set auth cookies |
| `GET` | `/auth/me` | Access cookie | Return the current user |
| `POST` | `/auth/refresh` | Refresh cookie + CSRF header | Rotate auth cookies |
| `POST` | `/auth/logout` | CSRF header | Clear auth cookies |
| `GET` | `/auth/users` | Admin access cookie | Return users list; supports `role`, `email`, and `name` query filters |

## Request Examples

Register:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

Login and save cookies:

```bash
curl -i -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

Get the current user:

```bash
curl -b cookies.txt http://localhost:4000/api/auth/me
```

For `/auth/logout` and `/auth/refresh`, send the `csrf_token` cookie value in the `x-csrf-token` header.

## Security Behavior

- `helmet()` sets common security headers.
- `app.disable("x-powered-by")` hides the Express header.
- CORS only allows origins listed in `CORS_ALLOWED_ORIGINS`; credentials are enabled.
- Access and refresh JWTs are stored in HTTP-only cookies.
- CSRF protection compares the readable `csrf_token` cookie with the `x-csrf-token` request header.
- Passwords are hashed with bcrypt before storage.
- Failed login attempts lock the account for 15 minutes after 5 failures.
- General `/api` requests are limited to 200 requests per 15 minutes.
- Auth-sensitive routes are limited to 10 requests per 15 minutes.

## Docker

Build and run the full stack from the repository root:

```bash
docker compose up --build
```

The server image installs dependencies, compiles TypeScript, exposes port `4000`, and runs `npm start`.

## Implementation Notes

- New users currently default to the `admin` role in `models/User.ts`, which is useful for course demos but should be changed for production-like behavior.
- `COOKIE_SECURE=true` is required for HTTPS deployments, especially if `COOKIE_SAME_SITE=none`.
- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` should be different high-entropy values.
- MongoDB must be reachable before the server starts listening.
