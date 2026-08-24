# Chess App

A mobile-first chess prototype built with Next.js 16 and React 19. It includes email/password authentication, a game lobby, local chess play, configurable clocks, and a lightweight browser AI.

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture, API contracts, game behavior, setup, and implementation status.

## Quick start

```bash
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2, from the repository root
npm install
npm run dev
```

Create `backend/.env` before starting the API:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/chess-app
JWT_SECRET=replace-with-a-long-random-secret
COACH_REGISTRATION_CODE=replace-with-a-private-coach-code
CLIENT_ORIGIN=http://localhost:3000
```

Copy `.env.example` to `.env.local` if the API is not running at the default `http://localhost:5000` address:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Open `http://localhost:3000`.

## Commands

| Location | Command | Purpose |
| --- | --- | --- |
| root | `npm run dev` | Start Next.js in development |
| root | `npm run build` | Create a production frontend build |
| root | `npm start` | Serve the frontend build |
| root | `npm run lint` | Run ESLint |
| `backend/` | `npm run dev` | Start Express with Nodemon |
| `backend/` | `npm start` | Start Express with Node.js |
