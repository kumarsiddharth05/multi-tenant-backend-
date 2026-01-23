# Deployment Guide: Render.com

This guide will help you deploy your Multi-Tenant Backend to Render (Free Tier).

## Prerequisites
- [x] Code pushed to GitHub (already done)
- [x] Render account (create one at https://render.com)

---

## Step 1: Create PostgreSQL Database

1. Go to your **Render Dashboard**.
2. Click **New +** and select **PostgreSQL**.
3. **Name**: `platform_db` (or any name).
4. **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
5. **Instance Type**: Select **Free**.
6. Click **Create Database**.
7. Wait for it to become available (Status: Available).

### Get Database Credentials
Once created, look for the **"Connections"** section or **"Access Control"**.
You need to copy these values for Step 2:
- `Host` (e.g., `dpg-xxxx-a.singapore-postgres.render.com`)
- `Port` (usually `5432`)
- `Database` (e.g., `platform_db_xyz`)
- `Username` (e.g., `platform_db_user`)
- `Password` (Copy this securely)

> **Important**: You do NOT need "Internal Connection URL" unless you modify the code. We will use individual variables.

---

## Step 2: Create Web Service

1. Go to **Dashboard** and click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Connect your GitHub account if needed, then select your repo: `multi-tenant-backend-`.
4. **Name**: `multi-tenant-backend`.
5. **Region**: **MUST match your Database region**.
6. **Branch**: `master`.
7. **Runtime**: `Node`.
8. **Build Command**: `npm install` (Default is correct).
9. **Start Command**: `npm start` (Default might be `node src/server.js` - change it to `npm start`).
10. **Instance Type**: **Free**.

---

## Step 3: Configure Environment Variables

Scroll down to **Environment Variables**. Add the following exactly:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | Paste **Host** from Step 1 |
| `DB_PORT` | `5432` |
| `DB_NAME` | Paste **Database** from Step 1 |
| `DB_USER` | Paste **Username** from Step 1 |
| `DB_PASSWORD` | Paste **Password** from Step 1 |
| `JWT_SECRET` | Generate a strong random string (e.g. `x8z7...`) |
| `JWT_EXPIRES_IN` | `1d` |

*(Note: `PORT` is automatically handled by Render, you don't need to add it).*

---

## Step 4: Deploy

1. Click **Create Web Service**.
2. Watch the logs. You should see "Server running on port...".
3. Once deployed, you will get a URL like: `https://multi-tenant-backend.onrender.com`.

---

## Step 5: Verify Deployment

Open your terminal (PowerShell) and test:

**Health Check:**
```bash
curl https://your-app-name.onrender.com/health
```

**Login Test:**
Be aware: The cloud database is **EMPTY**. You need to seed it or create a tenant first!
Since `seed.js` is local, you can:
1. Connect to the remote DB locally using pgAdmin/DBeaver.
2. OR: Use the API to create a Tenant transparently (if you allow it).
3. OR: Use the **Shell** tab in Render Dashboard and run `node seed.js` (Yes, you can do this!).

**Recommended: Run Seed on Render**
1. Go to **Shell** tab in Render Web Service.
2. Type `node seed.js`.
3. It should create the tables and the `owner@demo.com` user.
4. Now you can log in via API.
