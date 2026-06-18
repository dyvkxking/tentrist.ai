# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Copy the **Project URL** and **anon/public** key from Settings → API

## 2. Run Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query

This creates:
- `profiles` - User profiles linked to auth.users
- `api_keys` - User API keys for programmatic access
- `nodes` - GPU node registry
- `jobs` - Compute jobs
- `job_checkpoints` - Job checkpoint storage
- `node_heartbeats` - Time-series heartbeat data
- `slashing_events` - Record of slashing events

## 3. Configure OAuth Providers

### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret
4. In Supabase Dashboard → Authentication → Providers → GitHub, enable and add credentials

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID for Web Application
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → Google, enable and add credentials

### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add OAuth2 redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard → Authentication → Providers → Discord, enable and add credentials

## 4. Update Environment Variables

Add these to your `.env` file:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

And in `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Test Authentication

```bash
cd frontend
npm run dev
```

Visit `/login` - you should see GitHub, Google, and Discord login options.

## Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | Extends auth.users with display name, avatar, wallet |
| `api_keys` | User API keys for backend authentication |
| `nodes` | GPU nodes registered with the protocol |
| `jobs` | Compute jobs submitted by users |
| `job_checkpoints` | Saved checkpoints for job recovery |
| `node_heartbeats` | Time-series telemetry data |
| `slashing_events` | Record of all slashing events |

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own data
- Nodes can be viewed by anyone but only modified by their owners
- Jobs are private to the user who created them
