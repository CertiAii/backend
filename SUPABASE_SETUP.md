# Supabase Database Setup

## Step 1: Get Supabase Connection String

1. Go to [supabase.com](https://supabase.com)
2. Sign in and open your project
3. Click **Settings** (gear icon) → **Database**
4. Scroll to **Connection string** section

### Get Connection Pooling URL (for DATABASE_URL)
- Select **"Connection pooling"** mode
- Choose **Session** mode
- Copy the connection string
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-XX-XXXX-X.pooler.supabase.com:6543/postgres?pgbouncer=true`

### Get Direct Connection URL (for DIRECT_URL)
- Select **"Direct connection"** mode  
- Copy the connection string
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-XX-XXXX-X.pooler.supabase.com:5432/postgres`

## Step 2: Update .env File

```env
# Replace with your actual Supabase credentials
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-XX-XXXX-X.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-XX-XXXX-X.pooler.supabase.com:5432/postgres"
```

**Important:** 
- Replace `[PROJECT-REF]` with your Supabase project reference
- Replace `[PASSWORD]` with your database password
- Keep the port numbers: **6543** for pooling, **5432** for direct

## Step 3: Push Database Schema

```bash
cd backend
npx prisma db push
```

This will create all tables in Supabase:
- ✅ users
- ✅ verifications
- ✅ audit_logs

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Verify Connection

Start your backend:
```bash
npm run start:dev
```

Check logs for successful connection.

## Troubleshooting

### Error: "Tenant or user not found"
- Your password or project reference is incorrect
- Get fresh credentials from Supabase dashboard

### Error: "Connection timeout"
- Check your internet connection
- Verify Supabase project is active (not paused)
- Ensure you're using the correct region

### Error: "Database does not exist"
- Make sure you're using the **postgres** database (default)
- Check connection string format

## Supabase Dashboard Access

View your data in Supabase:
1. Open [supabase.com](https://supabase.com)
2. Go to **Table Editor**
3. You'll see your tables: `users`, `verifications`, `audit_logs`

## Testing

Create a test user via API:
```bash
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

Check Supabase dashboard to see the new user!
