# Multi-Tenant SaaS (Demo)

Simple fullstack demo of a multi-tenant SaaS application.

## Stack
- Backend: Node.js, Express, Mongoose (MongoDB)
- Frontend: Static HTML + Bootstrap + Axios

## How to run

1. Copy `.env.example` to `backend/.env` and set `MONGO_URI` and `JWT_SECRET`.
2. In the `backend` folder run:
   ```
   npm install
   npm run dev
   ```
3. Open `http://localhost:5000` in your browser.

## Features
- Tenant registration (creates tenant + admin user)
- Login with tenant name
- JWT authentication and tenant isolation
- Create and list users for the tenant from dashboard

