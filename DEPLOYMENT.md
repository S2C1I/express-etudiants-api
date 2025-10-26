# Deploying the Express + Socket.IO backend with MongoDB Atlas

This guide helps you put this API online (free options), connect it to MongoDB Atlas, and configure CORS for your frontend.

## 1) Prepare MongoDB Atlas

1. Create a free MongoDB Atlas account and a free Shared Cluster.
2. Create a database user with username/password.
3. Network Access: Allow your hosting provider to connect. Easiest: set IP Access List to `0.0.0.0/0` during development (restrict later).
4. Get the connection string (SRV):
   - It looks like: `mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority`.
5. In your environment variables, set:
   - `MONGODB_URI` to that full string (replace username/password/database).

The app reads `MONGODB_URI` (fallback: `mongodb://127.0.0.1:27017/etudiants`).

## 2) Required environment variables

- `PORT`: leave empty on most hosts, they inject it. For local: `3000`.
- `MONGODB_URI`: from Atlas (see above).
- `JWT_SECRET`: any long random string.
- `FRONTEND_ORIGIN`: your frontend URL(s). Can be a single URL, comma-separated list, or `*`.
  - Example: `FRONTEND_ORIGIN=https://my-frontend.app` or `http://localhost:4200,https://my-frontend.app`.

You can use `.env.example` as a template.

## 3) Choose a free host (WebSockets supported)

All options below support WebSockets (required by Socket.IO):

- Render (free tier, spins down on inactivity): easy, GitHub-based, supports WS.
- Railway (free starter): simple, supports WS.
- Fly.io (free allowance): powerful, requires `flyctl` and optionally a Dockerfile.
- Koyeb (free service): supports WS, deploy via Dockerfile or Git repo.

Vercel/Netlify are not ideal for a long-lived Socket.IO server.

## 4) Quick Deploy on Render (recommended)

1. Push this repository to GitHub.
2. Create a new Web Service on https://dashboard.render.com > New > Web Service and connect your repo.
3. Environment:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start` (package.json has `start: node server.js`)
4. Add Environment Variables in Render:
   - `MONGODB_URI` = your Atlas string
   - `JWT_SECRET` = a strong secret
   - `FRONTEND_ORIGIN` = your frontend origin(s)
5. Deploy. Render will provide a URL like `https://your-app.onrender.com`.
6. Update your frontend API base URL and Socket.IO URL to that domain.

Notes:

- Free plans may sleep. First request can take ~30s to wake up.
- Choose a Render region close to your Atlas cluster.

## 5) Alternative: Railway

1. Import your repo into https://railway.app (or use "Deploy from GitHub").
2. Railway auto-detects Node. Set variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`.
3. Start Command: `npm start`.
4. Deploy and use the provided domain.

## 6) Alternative: Fly.io

1. Install `flyctl` and run `fly launch` in the project (accept Node defaults; you can deploy without a Dockerfile).
2. Set secrets:
   - `fly secrets set MONGODB_URI=... JWT_SECRET=... FRONTEND_ORIGIN=...`
3. `fly deploy`

Fly binds to the platform-provided `PORT` automatically via `server.listen(process.env.PORT)` which is already in `server.js`.

## 7) CORS and Socket.IO config

- CORS is driven by `FRONTEND_ORIGIN`.
  - Single origin: `https://my-frontend.app`
  - Multiple: `https://app1.com,https://app2.com`
  - `*` allows all, but disables credentials. Use only for quick tests.
- Socket.IO uses the same origins.

## 8) Health check and test

Once deployed, test the API quickly:

- REST: `GET https://<your-domain>/etudiants`
- Auth: `POST https://<your-domain>/users/login` with email/password
- Socket.IO: connect your frontend client to `https://<your-domain>`

If something fails, check the host logs (Render/Railway dashboards) for errors like bad `MONGODB_URI` or missing `JWT_SECRET`.

## 9) Local run (optional)

- Copy `.env.example` to `.env` and fill values.
- Start locally:

```bash
npm install
npm run dev
```

API runs on `http://localhost:3000` by default.

---

Troubleshooting tips:

- `ECONNREFUSED` to Mongo: verify Atlas Network Access and credentials.
- CORS errors in browser: ensure `FRONTEND_ORIGIN` exactly matches your frontend origin (scheme + host + port).
- Socket.IO connection issues: use the same base URL as the API, and avoid mixed http/https.
