# Proposal: Account System

## Summary
Replace the env-var-hardcoded user list with a self-registration system. Users create their own accounts (username + password) stored in MongoDB. The HTTP Basic Auth wire protocol is unchanged — only the credential store moves from environment variables to the database.

## Problem
Currently, accounts must be pre-configured by a server administrator via `AUTH_USERNAME`/`AUTH_PASSWORD` or `AUTH_USERS` env vars and require a server restart to add new users. This prevents real multi-user adoption.

## Proposed Solution
Add a `User` model to MongoDB and a public `POST /auth/register` endpoint. The `basicAuth` middleware is updated to query the database instead of reading from env vars. No changes to session ownership (`createdBy`), no changes to the frontend auth flow — only the credential validation source changes.

### What changes
- New `User` MongoDB model: `{ username, passwordHash, createdAt }`
- New route: `POST /auth/register` — public (no auth required), validates uniqueness, bcrypt-hashes password
- `basicAuth` middleware: queries `User.findOne({ username })` + `bcrypt.compare` instead of env var map
- Frontend `LoginPage`: add "New here? Create an account" toggle that shows a Register form (same fields: USERNAME + PASSWORD) pointing at the register endpoint; on success auto-logs in

### What does NOT change
- HTTP Basic Auth protocol (no JWT, no sessions, no cookies)
- `Authorization: Basic <base64>` header on every request
- `res.locals.username` propagation through all routes
- Session `createdBy` field
- `AuthContext` and token storage in `localStorage`

## User Display Name
Username is the display name. No separate display-name field needed at this stage.

## Scope
- Backend: `User` model, register route, updated middleware
- Frontend: register toggle on `LoginPage`
- No password-change, no account deletion, no email verification

## Success Criteria
- A new visitor can create an account via the login page without admin involvement
- Existing Basic Auth flow continues to work unchanged for registered users
- Duplicate username registration returns a clear error
- Passwords are never stored in plaintext
