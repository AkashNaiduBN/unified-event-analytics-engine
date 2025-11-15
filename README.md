# Unified Event Analytics Engine (UEAE)
A complete backend analytics platform with API key management, event collection, aggregation
endpoints, caching, rate limiting, and Docker deployment.


## 1. Features Implemented
- API Key Management (register, regenerate, revoke, expiration)
- Event Collection API (web + mobile compatible)
- Analytics Endpoints (event-summary, user-stats)
- PostgreSQL schema + migrations
- Redis caching for analytics responses
- Rate limiting for ingestion & analytics
- Dockerized for deployment
- Swagger API docs
- Unit + integration tests
- Clean modular folder structure


## 2. Project Setup
### Clone repository
```
git clone
cd ueae_project
```
### Environment variables
Create `.env`:
```
PORT=4000
DATABASE_URL=postgres://postgres:postgres@db:5432/ueae
REDIS_URL=redis://redis:6379
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=1000
```
### Run using Docker
```
docker compose up --build
```
Services:
- App → port 4000
- PostgreSQL → port 5432
- Redis → port 6379
### Run migrations
Inside container:
```
docker exec -it ueae_project-app-1 sh
npm run migrate
```

## 3. API Endpoints
### Auth
- POST `/api/auth/register`
- GET `/api/auth/api-key`
- POST `/api/auth/revoke`
### Event Collection
- POST `/api/analytics/collect`
### Analytics
- GET `/api/analytics/event-summary`
- GET `/api/analytics/user-stats`
Full documentation at `/api-docs`.


## 4. Deployment
The application is deployed using Render.
Live URL: <https://unified-event-analytics-engine-md6n.onrender.com/api-docs/>


## 5. Challenges Faced & Solutions
1. Database Migrations & Schema Evolution
Challenge:
Managing schema changes for a high-volume events table can become tricky, especially when running locally vs inside Docker.
Solution:
Implemented a simple but reliable custom migration script (scripts/migrate.js) that automatically creates the required tables (apps, events) and ensures consistent database structure across all environments.

2. Slow Aggregation Queries
Challenge:
Endpoints like event-summary and user-stats perform heavy operations → COUNT, DISTINCT, GROUP BY, and JSON aggregations on large datasets.
Running these repeatedly would degrade performance.
Solution:
Added Redis caching for frequently accessed analytics responses.
Cached results expire every 60 seconds, drastically reducing PostgreSQL load and improving response time.

3. API Key Security
Challenge:
API keys must be stored securely and protected from misuse or leaking, since they authorize ingestion of analytics data.
Solution:
Keys are generated using UUIDv4.
Stored in hashed form inside the database.
Implemented expiration logic (expires_at).
Added ability to revoke keys immediately.
This ensures even if the database leaks, the raw keys are not exposed.

4. High-Traffic Event Ingestion
Challenge:
Event collection endpoints can be abused or hit extremely frequently from client websites or bots.
This can overload the server or database.
Solution:
Added rate limiting using express-rate-limit.
Indexed key columns in PostgreSQL:
event_type, timestamp, app_id, (metadata->>'userId').
Simplified ingestion logic to a single lightweight INSERT.
This ensures the API handles high-throughput traffic safely without degradation.

## 6. Future Enhancements
- Tracking script for websites
- Mobile SDK (Android + iOS)
- Admin dashboard (React)
- Automated event batching
- Partitioned PostgreSQL tables