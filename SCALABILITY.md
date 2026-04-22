# Scalability Plan

## 1. Move Toward Microservices

Current code is modular (`auth`, `task`, `user`) and can be extracted incrementally:

- `auth-service`: registration, login, token/refresh token lifecycle
- `task-service`: task CRUD and ownership checks
- `user-service`: admin user listing and profile operations

Recommended migration path:

1. Keep current monolith boundaries as internal contracts.
2. Extract one module at a time behind HTTP/gRPC APIs.
3. Add an API gateway/BFF for auth propagation and rate limiting.

## 2. Redis Caching Strategy

Use Redis for read-heavy and short-lived data:

- Cache task list responses by user (`tasks:user:{userId}`)
- Cache admin dashboard summary counts
- Cache JWT denylist/session metadata (if logout/invalidation is required)

Guidelines:

- Use short TTL for task lists (e.g., 30-120s)
- Invalidate cache on create/update/delete task operations
- Avoid caching sensitive user data beyond what is required

## 3. Load Balancing

Deploy multiple app instances behind a load balancer:

- L7 load balancer (Nginx/Cloud LB) with health checks
- Stateless API instances
- Sticky sessions not required when JWT is stateless

Best practices:

- Graceful shutdown handling
- Horizontal pod autoscaling based on CPU + request latency

## 4. Database Indexing and Query Scaling

Prisma models already include indexes on key fields (`users.email`, `tasks.userId`).

Further improvements:

- Add composite indexes for frequent filters/sorts (e.g., `userId + createdAt`)
- Use cursor-based pagination for large task lists
- Introduce read replicas for read-heavy workloads
- Monitor slow queries and tune indexes from query plans

## 5. Horizontal Scaling

To scale API throughput:

- Run multiple stateless Next.js server instances
- Use centralized Redis + PostgreSQL services
- Avoid in-memory state for auth/session data
- Use distributed tracing and metrics (OpenTelemetry, Prometheus/Grafana)

## 6. Auth Scaling (Refresh Tokens)

Current setup uses short-lived access tokens. For large-scale production:

- Add refresh tokens with rotation
- Store hashed refresh tokens in DB/Redis
- Revoke token families on suspicious activity
- Implement device/session tracking

Recommended token model:

- Access token: 10-15 minutes
- Refresh token: 7-30 days (rotating)
- Blacklist/denylist support for immediate revocation

## 7. Operational Checklist

- Add API rate limiting (per IP + per user)
- Add request ID and structured logging
- Add background job queue for async tasks (emails, notifications)
- Add circuit breakers/retries for external services
- Add automated backups and disaster recovery runbooks
