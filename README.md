# Pastebin Lite – Backend

A lightweight Pastebin-style backend API built using Node.js and Express.

This project allows users to:

- Create text pastes with optional TTL and max views
- Retrieve pastes via API or HTML view
- Set expiration by time or view count

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- Deployed on Render

## How to Run Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   - `DATABASE_URL` for PostgreSQL connection
   - `PORT` (optional, defaults to 3000)
   - `TEST_MODE=1` for deterministic testing (optional)
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm start`

## Persistence Layer

The application uses Prisma ORM with PostgreSQL for data persistence. The database schema includes a `Paste` model with fields for id, content, expiration time, max views, and view count.

## Notable Design Decisions

- Uses base64url encoded IDs for short URLs
- Supports deterministic time for testing via environment variable and header
- Always returns 404 for expired or unavailable pastes
- Safe HTML rendering with content escaping to prevent XSS
- Health check endpoint verifies database connectivity

<!-- API URL -->

https://pastebin-lite-backend-4q4z.onrender.com
