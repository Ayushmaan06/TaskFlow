# TaskFlow API (Next.js + Prisma + JWT + RBAC)

Production-style REST API with authentication and role-based access control, plus a minimal frontend for register/login/task management.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 7 + PostgreSQL (Neon-compatible)
- JWT (`jsonwebtoken`) authentication
- Password hashing with `bcryptjs`
- Validation with Zod
- API docs via Swagger (`/api-docs`)

## Environment Variables

Create `.env` in project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="15m"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma Client

```bash
npx prisma generate
```

3. Run migrations

```bash
npx prisma migrate dev
```

4. Start dev server

```bash
npm run dev
```

5. Open app and docs

- App: `http://localhost:3000`
- API Docs (Swagger UI): `http://localhost:3000/api-docs`
- Raw OpenAPI JSON: `http://localhost:3000/api/swagger`

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint project

## API Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Tasks (JWT required)

- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Users (ADMIN only)

- `GET /api/v1/users`

## Auth Flow

1. Register user (default role: `USER`).
2. Login with email/password to receive JWT.
3. Send JWT in header:

```http
Authorization: Bearer <token>
```

## Response Format

All APIs follow a consistent response structure:

```json
{
	"success": true,
	"data": {},
	"message": "..."
}
```

Error responses include:

```json
{
	"success": false,
	"message": "...",
	"errors": {}
}
```

## Notes

- Passwords are hashed with bcrypt and never returned in responses.
- JWT payload includes user id (`sub`), email, and role.
- Task routes enforce ownership checks.
- Admin route enforces RBAC via role checks.

For scaling strategy, see `SCALABILITY.md`.
