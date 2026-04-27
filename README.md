# 🍴 Central Kitchen — Demo

A fully self-contained demo of the Central Kitchen Order Management System.
Runs locally with **one command** — no accounts, no API keys, no config needed.

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / Mac / Linux)
- That's it.

---

## Start the demo

```bash
docker compose up --build
```

First run takes ~2–3 minutes to download images and build.
Subsequent starts take ~15 seconds.

Then open:

| URL | What |
|---|---|
| **http://localhost:5173** | The app |
| **http://localhost:8025** | MailHog — view all sent emails |

---

## Demo accounts

All passwords are **`demo1234`** — or just click the quick-login buttons on the login screen.

| Email | Role | Access |
|---|---|---|
| admin@kitchen.local | Admin | Everything |
| kitchen@kitchen.local | Kitchen Staff | Board, catalogue, production summary |
| smokehouse@kitchen.local | Site Manager | The Smokehouse only |
| spiceroute@kitchen.local | Site Manager | Spice Route only |
| burgerbar@kitchen.local | Site Manager | Burger Bar only |

---

## What to try

1. **Log in as a site manager** → place an order → check MailHog for the kitchen notification email
2. **Log in as kitchen staff** → advance the order status → check MailHog for the site update email
3. **Log in as kitchen staff** → open Production Summary → select today's date to see aggregated totals
4. **Log in as kitchen staff** → open Catalogue → add or edit a product
5. **Log in as admin** → All Orders → filter by site or status

---

## Stop the demo

```bash
docker compose down
```

To also wipe the database (start fresh next time):

```bash
docker compose down -v
```

---

## Ports used

| Port | Service |
|---|---|
| 5173 | Frontend (React app) |
| 3001 | API (Express) |
| 8025 | MailHog web UI |
| 1025 | MailHog SMTP (internal) |

If any port is already in use, edit `docker-compose.yml` and change the left-hand port number.

---

## Architecture

```
browser → nginx (port 5173)
               ↓
         React SPA (static)
               ↓ fetch /api/*
         Express API (port 3001)
               ↓
         PostgreSQL (internal)
               ↓ SMTP
         MailHog (port 8025)
```
