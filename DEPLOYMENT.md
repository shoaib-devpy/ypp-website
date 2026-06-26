# Deployment Guide

This project is a static public site plus a Next.js admin/backend app in `admin/`.

## What runs where

- Public site: the HTML/CSS/JS files in the repo root.
- Admin app and API: `admin/`.
- Database: PostgreSQL, used by the admin app and public site API calls.

## cPanel setup

1. Create a PostgreSQL database and a database user in cPanel.
2. Assign the user to the database with full privileges.
3. Create a Node.js app in cPanel.
4. Set the app root to the `admin` folder inside this repo.
5. Set the startup file to `server.js`.
6. Use Node 20 or newer.

## Environment variables

Set these in the cPanel Node app:

- `DATABASE_URL` if you have a full Postgres connection string.
- Or set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` instead.
- `ADMIN_SESSION_SECRET` for the admin login cookie token.
- `ADMIN_BOOTSTRAP_EMAIL` for the first admin account.
- `ADMIN_BOOTSTRAP_PASSWORD` for the first admin account password.
- `ADMIN_BOOTSTRAP_NAME` if you want a custom admin display name.
- `SEED_DEFAULT_DATA` keeps the starter content enabled. Leave it `true` for a fresh deploy.
- `PGSSLMODE=require` or `DATABASE_SSL=true` only if your Postgres provider requires SSL.

## Deploy steps

1. Upload the repo so the folder structure stays intact.
2. Keep `admin/public/frontend` as a relative symlink to the repo root. Do not replace it with a copied folder.
3. In the `admin` folder, run `npm install`.
4. Run `npm run build`.
5. Start or restart the Node app.

## What happens on first start

- The app creates the required tables if they do not exist.
- Default content is seeded into pages, programs, leadership, core team, gallery, certificates, reports, partners, social links, and slider items.
- If `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` are set, the first admin user is created automatically.

## After deploy

1. Open the public site in the browser and confirm the home page loads.
2. Open `/admin/login` and sign in with the bootstrap admin credentials.
3. Update email settings inside the admin panel if you want form emails to send.
4. Replace any starter content you do not want to keep.

## Notes

- `admin/public/uploads` is created automatically when files are uploaded.
- If you want a blank install, set `SEED_DEFAULT_DATA=false` before the first start.
