# Design: Account System

## Architecture

```
POST /auth/register  (public, no basicAuth middleware)
         │
         ▼
  User model (MongoDB)
  { username, passwordHash, createdAt }
         │
         ▼
basicAuth middleware (async)
  User.findOne({ username }) + bcrypt.compare
         │
         ▼
  res.locals.username  ─── all existing routes unchanged
```

## Backend

### New: `backend/src/models/User.ts`
Mongoose model with `username` (unique index), `passwordHash` (bcrypt, 10 rounds), `createdAt` (timestamps).

### New: `backend/src/routes/auth.ts`
`POST /auth/register` — public endpoint (no basicAuth):
- Validate `username` and `password` present → 400
- `User.findOne({ username })` → 409 if exists
- `bcrypt.hash(password, 10)` → save new User
- Return `201 { username }`

Mounted in `server.ts` at `/auth`.

### Updated: `backend/src/middleware/basicAuth.ts`
Becomes `async`. Replaces env-var map lookup with:
```ts
const user = await User.findOne({ username })
if (!user || !(await bcrypt.compare(password, user.passwordHash))) → 401
```
Wraps DB call in try/catch → 500 on error.
The env-var fallback is removed — accounts must be registered via the API.

### Dependency: `bcryptjs` + `@types/bcryptjs`
Pure-JS implementation, no native compilation needed.

## Frontend

### New: `frontend/src/api/auth.ts`
```ts
register(username, password): Promise<void>
```
`POST /auth/register` with JSON body. Throws `Error(body.error)` on non-2xx so LoginPage can display the server message (e.g. "Username already taken").

### Updated: `frontend/src/pages/LoginPage.tsx`
Add `mode` state: `'login' | 'register'`.

- Toggle link below the form: "New here? Create an account" ↔ "Already have an account? Sign in"
- In `'register'` mode: form title changes to `"CREATE ACCOUNT"`, subtitle to `"CHOOSE YOUR CALLSIGN"`, button text to `"INSERT COIN"` / `"CREATING..."`
- On register success: call `login(username, password)` then navigate to `/sessions` — same auto-login flow as login
- On register error: show server error message (e.g. "Username already taken") in `errorText` style

Both modes share the same `username` / `password` input fields and form layout. No additional fields.
