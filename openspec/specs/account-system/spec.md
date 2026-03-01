# Spec: Account System

## Registration

### Backend
- `POST /auth/register` is a public endpoint (no authentication required)
- Body must contain non-empty `username` and `password` → `400` otherwise
- Returns `409` with `{ error: "Username already taken" }` if username exists
- Passwords are stored as bcrypt hashes (never plaintext)
- Returns `201 { username }` on success

### Frontend
- `LoginPage` has a toggle between login and register modes
- Register mode shows the same username/password fields
- On register success, the user is automatically logged in and redirected to `/sessions`
- Server error messages (e.g. "Username already taken") are displayed to the user

## Authentication

- `basicAuth` middleware queries the `User` MongoDB collection instead of env vars
- Invalid credentials (user not found or wrong password) return `401`
- The `Authorization: Basic <base64>` wire protocol is unchanged
- All existing protected routes continue to work without modification
- `res.locals.username` is set from the authenticated user's username

## User Model

- Fields: `username` (string, unique), `passwordHash` (string), `createdAt` (date)
- Username uniqueness is enforced at the database level (unique index)
