# Security Course Client

React + TypeScript frontend for the Node.js security course demo. The app talks to the Express API, stores authentication state in server-set cookies, and automatically sends the CSRF token required by protected unsafe requests.

## What This App Does

- Register a user with name, email, and password.
- Log in through the backend `/auth/login` endpoint.
- Load the current user from `/auth/me` using cookie-based authentication.
- Log out through `/auth/logout`.
- Fetch the admin-only users list from `/auth/users`.

The UI is intentionally minimal so the security flow is easy to inspect while learning.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Nginx for the Docker production image

## Project Structure

```text
client/
  src/
    api.ts              Axios client and CSRF header handling
    App.tsx             Routes and top-level navigation
    pages/
      Home.tsx          Current user, logout, and admin users list
      Login.tsx         Login form
      Register.tsx      Registration form
  nginx.conf            Static file server config for Docker image
  Dockerfile            Multi-stage Vite build served by Nginx
```

## Environment Variables

Create or update `client/.env` for local development:

```bash
VITE_API_URL=http://localhost:4000/api
```

For Docker builds, `VITE_API_URL` is passed as a build argument from the root `docker-compose.yaml`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`.

The backend must be running and `VITE_API_URL` must point to its `/api` base path.

## Available Scripts

```bash
npm run dev      # Start Vite with hot reload
npm run build    # Type-check and create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Authentication And CSRF Flow

The server sets these cookies after login:

- `access_token`: HTTP-only access JWT.
- `refresh_token`: HTTP-only refresh JWT.
- `csrf_token`: readable CSRF token.

`src/api.ts` creates an Axios client with `withCredentials: true`, so browser requests include cookies. For `POST`, `PUT`, `PATCH`, and `DELETE` requests, it reads `csrf_token` from `document.cookie` and sends it as the `x-csrf-token` header.

## Docker

Build and run through the root compose file:

```bash
docker compose up --build
```

The client image builds the Vite app with Node, then serves the generated `dist` files with Nginx on port `80`.

## Notes For Learners

- The login and register forms include default demo values for quick testing.
- The client currently stores `res.data.token` in `localStorage`, but the current backend login response does not return a token because authentication uses cookies. This line is not needed for the cookie-based flow.
- Cross-origin cookie auth requires the backend CORS allowlist, cookie `sameSite`, cookie `secure`, and the frontend API URL to agree.
