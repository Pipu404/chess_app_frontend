# Chess App — Technical Documentation

## Overview

Chess App is a mobile-first web prototype with two independent applications: a Next.js 16 App Router frontend and an Express 5 API backed by MongoDB.

The frontend owns live chess-game state. `chess.js` validates moves and detects terminal positions, while a browser Stockfish Web Worker selects AI moves and analyzes completed games. The Express API stores authentication, classrooms, puzzles, homework, attempts, ratings, analytics, and coach feedback.

### Capability status

| Capability | Status | Notes |
| --- | --- | --- |
| Signup and login | Implemented | Coach, student, and player roles; bcrypt password hash and seven-day JWT |
| Authenticated route gate | Implemented | Verifies an `HttpOnly` cookie session through `/api/auth/me` |
| Local chess | Implemented | Two players can use the same browser board |
| AI chess | Implemented | Portable single-threaded Stockfish WASM with depth mapped to difficulty |
| Clocks and increments | Implemented | Clock starts after the first user move |
| Checkmate/draw detection | Implemented | Delegated to `chess.js` |
| Online chess | Not implemented | No socket, matchmaking, or synchronization flow |
| Chat/inbox | UI demo | Hard-coded contacts and in-memory replies |
| Profile/preferences | Placeholder | Menu entries have no views |
| Puzzles | Implemented | MongoDB-backed daily/rated puzzles plus coach-created homework puzzles |
| Password recovery | Placeholder | Link points to `#` |
| Game persistence | Implemented for completed games | Stores validated moves, PGN/FEN, results, and Stockfish reviews per user |

## Architecture

```text
Browser
  |-- Next.js UI (localhost:3000)
  |     |-- authentication screens
  |     |-- lobby and demo inbox
  |     `-- chess.js state, clocks, and heuristic AI
  |
  `-- HTTP JSON --> Express API (localhost:5000)
                         `-- Mongoose --> MongoDB
```

There is no Next.js server-side data layer. Behavioral pages are Client Components, and authentication requests go directly from the browser to Express.

### Stack

| Layer | Technology |
| --- | --- |
| UI | Next.js 16.2.6, React 19.2.4 |
| Styling | Tailwind CSS 4 through PostCSS |
| Chess rules | chess.js 1.4 |
| Icons | lucide-react and react-icons |
| API | Express 5.2 |
| Data/auth | MongoDB, Mongoose 9.6, bcryptjs, jsonwebtoken |

## Repository structure

```text
chess-app/
├── src/app/
│   ├── layout.js          # Root shell, fonts, metadata
│   ├── globals.css        # Tailwind and global theme
│   ├── page.js            # Lobby and demo inbox/chat
│   ├── login/page.js      # Login form
│   ├── signup/page.js     # Registration form
│   ├── new-game/page.js   # Game configuration
│   └── play/page.js       # Board, AI, clocks, result
├── backend/
│   ├── server.js          # Express and MongoDB bootstrap
│   ├── models/User.js     # User model
│   └── routes/auth.js     # Signup/login endpoints
├── next.config.mjs        # Remote image allowlist
└── package.json           # Frontend scripts/dependencies
```

`backend/` is ignored by the outer repository and has its own `.git` directory. It is not configured as a submodule, so cloning only the outer repository does not reproduce the backend.

## Frontend routes

| URL | Purpose | Access |
| --- | --- | --- |
| `/` | Game lobby, profile menu, demo inbox | Redirects when no token string exists |
| `/login` | Login | Public |
| `/signup` | Registration | Public |
| `/new-game` | Game configuration | Redirects when no token string exists |
| `/play` | Chess game | No authentication check currently |

The root layout loads Geist through `next/font/google`. Its metadata still says “Create Next App” and should be updated before release.

### Game URL

Starting a game navigates to:

```text
/play?mode=<mode>&time=<minutes+increment>&side=<White|Black>&difficulty=<level>
```

| Parameter | UI values | Default | Effect |
| --- | --- | --- | --- |
| `mode` | `online`, `ai`, `local` | `online` | Only `ai` changes game logic today |
| `time` | `1+0` through `30+20`, or `Custom` | `10+0` | Initial minutes and seconds added per move |
| `side` | `White`, `Black` | `White` | Player color and board orientation |
| `difficulty` | `Easy`, `Medium`, `Hard`, `Expert` | `Medium` | AI selection heuristic |

`Custom` has no input form and resolves to 10 minutes with no increment. Unsupported query values are replaced with the defaults shown above before game state is initialized.

## Authentication

### Signup

1. The browser posts `name`, `email`, `password`, and `role` to `/api/auth/signup`. Coach registration also requires the private server-configured coach code.
2. The API rejects an existing email.
3. bcrypt hashes the password with a generated salt and 10 rounds.
4. Mongoose creates the user.
5. The API signs `{ userId, role }` as a JWT expiring in seven days.
6. The API sets it as an `HttpOnly`, `SameSite=Lax` cookie and the browser opens `/`.

Login follows the same cookie-session flow after bcrypt verifies the password. The client verifies the session through `GET /api/auth/me`; logout clears it through `POST /api/auth/logout`.

## API reference

Default base URL: `http://localhost:5000/api/auth`

### `POST /signup`

```json
{
  "name": "Ada Player",
  "email": "ada@example.com",
  "password": "secret"
}
```

Success: `201 Created`

```json
{
  "user": {
    "id": "<mongo-object-id>",
    "name": "Ada Player",
    "email": "ada@example.com"
  }
}
```

Errors: `400 { "msg": "User already exists" }` or `500 { "error": "..." }`.

### `POST /login`

```json
{
  "email": "ada@example.com",
  "password": "secret"
}
```

Success: `200 OK` with the same response shape as signup. Invalid credentials return `400 { "msg": "Invalid credentials" }`.

### User model

| Field | Type | Constraint |
| --- | --- | --- |
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required bcrypt hash |
| `role` | String | Required enum: `coach`, `student`, or `player`; defaults to `player` |
| `createdAt` | Date | Defaults to creation time |

There is no request schema validation, email normalization, password policy, or rate limiting.

## Chess behavior

### Moves

1. Selecting the active side's piece asks `chess.js` for legal moves.
2. Destination squares are highlighted.
3. Selecting one calls `game.move()`; promotion always chooses a queen.
4. The moving side receives the configured increment.
5. Board, turn, and verbose history synchronize from the `Chess` instance.
6. `chess.js` is checked for checkmate or draw.

The UI shows the latest four half-moves. Undo removes one half-move in non-AI modes and attempts to remove two in AI mode.

### Clocks

- Both clocks begin at the configured initial time.
- In AI mode, timing starts as soon as the game loads. In local and placeholder online modes, timing starts after the first move.
- The active clock loses one second per tick.
- Zero causes a timeout loss; reset restores position and clocks.
- If the player chooses Black in AI mode, the AI's opening move occurs while both clocks remain stopped. Timing begins after the player replies.

### AI

AI play uses the portable single-threaded Stockfish WASM engine in a Web Worker. Difficulty maps to search depth: Easy 5, Medium 8, Hard 11, and Expert 14. The same queued UCI engine analyzes completed games at depth 9 for move classification and evaluation.

AI moves use a short visible thinking interval, allowing its active clock to consume time before the move is made.

## Setup

### Prerequisites

- Node.js 20.9 or newer
- npm
- MongoDB

Create `backend/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/chess-app
JWT_SECRET=replace-with-a-long-random-secret
```

Start both applications:

```bash
# backend terminal
cd backend
npm install
npm run dev

# frontend terminal, repository root
npm install
npm run dev
```

The frontend reads `NEXT_PUBLIC_API_URL` at build time and falls back to `http://localhost:5000` for local development. Copy `.env.example` to `.env.local` to override it. Authentication requests share one JSON client that provides consistent messages for rejected requests, unreachable servers, and malformed successful responses.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | Browser-visible API origin; default `http://localhost:5000` |
| `MONGODB_URI` | Yes | Mongoose connection URI |
| `JWT_SECRET` | Yes | JWT signing secret |
| `COACH_REGISTRATION_CODE` | For coaches | Private code required when creating a Coach account |
| `PORT` | No | Express port; default `5000` |

### Remote assets

`next.config.mjs` permits `upload.wikimedia.org` chess pieces and `api.dicebear.com` avatars. The game uses these images unoptimized, so network failures can hide pieces or avatars.

## Quality status

There are no automated unit, integration, or end-to-end tests.

As of 2026-08-24, both `npm run lint` and `npm run build` pass. The `/new-game` runtime search parameters are isolated behind Suspense, React hook findings are resolved, and Turbopack uses the repository as its explicit workspace root.

## Risks and recommended work

### Release readiness

1. Restrict production CORS to configured frontend origins.
2. Define how the separately versioned backend is distributed.
3. Add CI and automated tests.
4. Add route-specific metadata and social preview assets if public discovery is required.

### Security

1. Add authentication middleware and protected server resources.
2. Prefer secure `HttpOnly`, `SameSite` cookies to browser `localStorage` for session credentials.
3. Add payload validation, email normalization, password rules, rate limiting, and generic production errors.
4. Fail startup clearly if MongoDB cannot connect; Express currently listens even after connection failure.

### Product completion

1. Implement authoritative online games, matchmaking, reconnects, and WebSockets.
2. Persist games, results, ratings, messages, and clock state.
3. Integrate a real engine or rename the current opponent.
4. Add promotion choice, full move history, and mode-appropriate resignation behavior.
5. Replace hard-coded chat data or label it clearly as a demo.
6. Add keyboard board controls and API/remote-image error states.

### Suggested tests

Cover signup/login failures, token expiry, legal and special chess moves, all terminal conditions, clock increment/timeout/reset, AI opening and undo, URL validation, direct `/play` access, and eventually online synchronization.
