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
npm run seed:vendors
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
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=
SMTP_SECURE=false
SMTP_FROM=marketing@coldcreekfarm.com
SMTP_OWNER_EMAIL=jeff@coldcreekfarm.com
SMTP_REPLY_TO=jeff@coldcreekfarm.com
NOTIFY_VENDORS=false
VENDOR_TEST_EMAIL=
```

- `PORTAL_URL` — public base URL used in emails (`{{PORTAL_URL}}/login` and vendor reply links)
- `SMTP_*` — provider-independent SMTP settings. The example host is Resend; any SMTP provider works
- `SMTP_FROM` — public From address (`marketing@coldcreekfarm.com`)
- `SMTP_OWNER_EMAIL` / `SMTP_REPLY_TO` — owner copy and reply address on portal emails
- `NOTIFY_VENDORS` — set to `true` only when vendors should receive selection emails. While it is `false`, those emails go to `SMTP_OWNER_EMAIL` when email notifications are on
- `VENDOR_TEST_EMAIL` — optional. If the selected vendor’s email matches this address, that inbox still receives the vendor-pick email during development

### Where to obtain SMTP credentials

Ask the Cold Creek Farm email administrator for the SMTP host, port, username, and password for the approved sending address. Put those values only in server environment variables / hosting secrets.

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
3. Frontend redirects to `/change-password`. Admin and client routes stay blocked until the password is changed.
4. Client submits current temporary password + new password (`POST /api/auth/change-password`).
5. Backend updates `password_hash` and sets `must_change_password = false`.
6. Client can then use the client portal (`/client`).

## Vendors

Admin → Vendors has three pages:

1. **All Vendors** — the preferred vendor directory (category, name, phone, email, website). The Bookings column on this page shows every event that vendor is aligned with: client, date, and status. Only Active vendors are offered to clients. Opening a vendor shows the same bookings again.
2. **Categories** — Florist, Photographers, Catering, DJs, Rentals, and Wedding Officiants are required for every event and cannot be renamed, disabled, or removed. Other categories are optional: an admin can add, rename, or set them Inactive. An Inactive category is hidden from clients.
3. **Selections** — monitoring only. It shows each booking’s progress on the six required categories and whether selections are still Open or Locked. Clients choose the vendors on their own Vendor Selections page. A choice starts as Pending; the vendor accepts or marks unavailable from the email link. Selections lock a set number of days before the event (default 90, changed in Settings).

On All Vendors, the Bookings column lists every booking for that vendor. Vendors with no events show “No bookings.”

`npm run seed:vendors` loads the preferred vendor list. `npm run seed:clients` and `npm run seed:bookings` do not insert sample records.

Architecture note: login credentials live on the existing `users` table (not duplicated onto `clients`). New clients get `clients.user_id` pointing at their `CLIENT` user row.
