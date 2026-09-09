# Cold Creek Farm Portal — Database

This project uses **PostgreSQL**.

Application tables and the full schema have not been created yet. Those will be designed and reviewed before any business tables are added.

## Migrations

SQL migration scripts will be stored in:

```
database/migrations/
```

## Seed scripts

Seed data scripts will be stored in:

```
database/seeds/
```

## Local configuration

PostgreSQL connection details are **not** hard-coded. The backend reads them from environment variables in `backend/.env`.

Copy `backend/.env.example` to `backend/.env` (if needed) and set:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REMEMBER_EXPIRES_IN`

## Authentication users

The minimum authentication table is created by:

```
database/migrations/001_create_users.sql
```

Apply it from the backend folder:

```
npm run migrate
npm run seed:auth
```

That creates local test users only. Passwords are hashed before they are stored.


`backend/.env` is gitignored and must not be committed.
