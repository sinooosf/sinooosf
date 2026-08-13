# SINOO SF Portfolio + Admin Dashboard

This package keeps the existing portfolio UI/design and adds a small Node/Express backend plus a password-protected admin dashboard.

## Included

- Admin dashboard at `/admin`
- Admin password: `G6dnC` by default
- JWT login
- Status: add / edit / delete
- Skills: add / edit / delete
- Projects: add / edit / delete
  - name
  - tag
  - image
  - URL
  - number/order
- Contact messages from both the hero modal and footer
- Mark messages as read / delete messages
- Project cards open the URL saved in the dashboard
- Existing project images are copied into `server/uploads`
- JSON persistence in `server/db.json`
- Render deployment template with a persistent disk

## Run locally

1. Open a terminal in this folder.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env`.
4. Start the backend:

```bash
npm start
```

5. Open:

- Portfolio frontend: your normal Vite URL (`npm run dev`)
- Admin: `http://localhost:4000/admin`

The default admin password is `G6dnC`.

## Connect the frontend to a hosted backend

When the backend is deployed, set this frontend environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

Then rebuild/redeploy the Vite frontend.

For local development, leave `VITE_API_URL` empty. The portfolio will still use its original visual fallback content if the API is unavailable.

## Deploy backend on Render

The included `render.yaml` creates a Node web service with a persistent disk because the project stores its JSON database and uploaded images under `server/`.

Set these environment variables in Render:

```text
ADMIN_PASSWORD=G6dnC
JWT_SECRET=<long-random-secret>
FRONTEND_ORIGIN=https://YOUR-FRONTEND-DOMAIN
```

After deployment, your admin dashboard will be:

```text
https://YOUR-BACKEND-DOMAIN/admin
```

And the public API is:

```text
https://YOUR-BACKEND-DOMAIN/api/public
```

## Important

The frontend was not redesigned. The changes are functional data connections only:

- Projects are loaded from the backend and retain the same cards/layout.
- The saved project URL is used as the project link.
- Skills are loaded from the backend.
- The portfolio status is loaded from the backend.
- Hero/footer contact forms send their existing form data to the backend.

For production, change the default password from `G6dnC` to a stronger value in the hosting environment.
