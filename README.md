# Cold Creek Farm Portal

The Cold Creek Farm Portal is a web application for managing Cold Creek Farm operations.

## Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Email:** Nodemailer (SMTP provider-independent)

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and set database + `JWT_SECRET` values.
2. Install and migrate:

```bash
npm install --prefix backend
npm install --prefix frontend
npm run migrate
npm run seed:auth
```

3. Build frontend and start:

```bash
npm run build --prefix frontend
npm start
```

Open `http://localhost:3000/login`.

Default seeded admin: `admin@coldcreekfarm.com` / `CcfAdmin123!`

## Client onboarding email (Nodemailer)

When an Admin creates a client under **Clients → Add New Client**, the backend:

1. Validates the client fields
2. Ensures the email is unique
3. Creates a linked `users` login row with role `CLIENT`
4. Uses the client email as the username (same as existing auth)
5. Generates a secure temporary password, stores only `password_hash`
6. Sets `must_change_password = true`
7. Sends a welcome email through Nodemailer

### Required environment variables

Configure these in `backend/.env` (never in the React app, never commit real secrets):

```
PORTAL_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=info@coldcreekfarm.com
SMTP_PASSWORD=
SMTP_SECURE=false
SMTP_FROM=info@coldcreekfarm.com
```

- `PORTAL_URL` — public base URL used in the email (`{{PORTAL_URL}}/login`)
- `SMTP_*` — provider-independent SMTP settings
- Intended From address: `info@coldcreekfarm.com`
- The Cold Creek Farm email administrator must supply the real SMTP host/password once the mailbox provider is confirmed (do not assume Microsoft 365 or Google Workspace)

### Where to obtain SMTP credentials

Ask the Cold Creek Farm email administrator for the mailbox SMTP host, port, username, and password for `info@coldcreekfarm.com` (or the approved sending address). Put those values only in server environment variables / hosting secrets.

### Local email testing

1. Set SMTP values in `backend/.env` for a test inbox or local catcher (Mailhog, Mailpit, Ethereal, etc.).
2. Restart the API.
3. Create a client in the Admin portal.
4. Confirm the welcome email arrives with username + temporary password.
5. If SMTP is missing or fails, the client is still created and Admin sees that the email was not sent. Use **Resend welcome email** on the client view (this regenerates a new temporary password).

### Production SMTP

Set the same `SMTP_*` and `PORTAL_URL` variables in the production host secrets. Keep `SMTP_SECURE=true` only when your provider requires TLS on the chosen port (commonly port 465).

### Temporary password + mandatory change flow

1. Client signs in at `/login` with email + temporary password.
2. API returns `mustChangePassword: true`.
3. Frontend redirects to `/change-password` (admin routes are blocked until changed).
4. Client submits current temporary password + new password (`POST /api/auth/change-password`).
5. Backend updates `password_hash` and sets `must_change_password = false`.
6. Client can then use the client portal (`/client`).

What the admin portal, client portal, and vendor-reply emails do is written up in [docs/FUNCTIONALITY.md](docs/FUNCTIONALITY.md).

What those flows were tested for is written up in [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

Architecture note: login credentials live on the existing `users` table (not duplicated onto `clients`). New clients get `clients.user_id` pointing at their `CLIENT` user row.
