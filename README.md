# EdTech Backend - Secure Video Streaming API

A Node.js backend architecture designed for a high-traffic educational platform. 

## Technical Overview
* **Secure Video Delivery:** Implementation of signed HMAC tokens for BunnyCDN to prevent unauthorized sharing of premium course content.
* **Database Management:** Managed PostgreSQL via Neon with Prisma ORM for type-safe data handling and relational integrity.
* **Progress Tracking:** Optimized API endpoints for tracking granular course completion data.

## Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, Prisma ORM
* **Security:** HMAC-SHA256 Tokenization

## Setup Instructions
1. Clone the repository and run `npm install`.
2. Configure the `.env` file with the appropriate `DATABASE_URL`.
3. Run `npx prisma generate` to initialize the Prisma client.
4. Start the development server using `npm run dev`.

## API Testing
The following endpoints can be tested via Thunder Client or Postman:
* POST /api/enroll: Enroll a user in a specific course.
* GET /api/videos/:id/stream: Retrieve a secure, time-limited streaming URL.
* POST /api/progress: Update student watch time using upsert logic.
