# Tasks: Account System

## Phase 1 — Backend

- [x] Add `bcryptjs` and `@types/bcryptjs` to `backend/package.json`
- [x] Create `backend/src/models/User.ts` — Mongoose model `{ username (unique), passwordHash, createdAt }`
- [x] Create `backend/src/routes/auth.ts` — `POST /auth/register`: validate body, check uniqueness (409), bcrypt hash, save, return 201
- [x] Update `backend/src/middleware/basicAuth.ts` — async, query User model + bcrypt.compare, remove env-var map
- [x] Register auth routes in `backend/src/server.ts` at `/auth`

## Phase 2 — Frontend

- [x] Create `frontend/src/api/auth.ts` — `register(username, password)` calling `POST /auth/register`
- [x] Add register toggle to `frontend/src/pages/LoginPage.tsx` — mode state `'login' | 'register'`, on success auto-login and navigate
