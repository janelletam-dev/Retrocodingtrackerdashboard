# Supabase Setup Guide for Vibe OS v2.1

## ✅ Prerequisites
You need a Supabase account and project. If you don't have one:
1. Go to https://supabase.com
2. Sign up and create a new project
3. Wait for the project to finish setting up (~2 minutes)

---

## 🗄️ Step 1: Create the Database Table

The app uses a key-value store table to save all your data (tasks, victories, settings, etc.).

### Option A: Using SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste this SQL code:

```sql
CREATE TABLE kv_store_91171845 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Option B: Using Table Editor

1. Go to **Database** → **Tables** in your Supabase Dashboard
2. Click **Create a new table**
3. Set table name: `kv_store_91171845`
4. Add columns:
   - Column 1: `key` (type: `text`, Primary Key, NOT NULL)
   - Column 2: `value` (type: `jsonb`, NOT NULL)
5. Click **Save**

### Verify the table exists:
- Go to **Database** → **Tables**
- You should see `kv_store_91171845` in the list
- The link is: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/tables

---

## 🚀 Step 2: Deploy the Edge Function

The backend server needs to be deployed to Supabase Edge Functions.

### Prerequisites:
- Install Supabase CLI: https://supabase.com/docs/guides/cli/getting-started

```bash
# Install Supabase CLI (choose your platform)
npm install -g supabase

# Or with Homebrew (Mac)
brew install supabase/tap/supabase
```

### Deploy the Edge Function:

1. **Login to Supabase CLI:**
```bash
supabase login
```

2. **Link your project:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```
   - Find your project ID in the Supabase URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`
   - Or in **Settings** → **General** → **Reference ID**

3. **Deploy the edge function:**
```bash
supabase functions deploy server
```

4. **Verify deployment:**
   - Go to **Edge Functions** in your Supabase Dashboard
   - You should see `server` function listed
   - Status should be **Active**

---

## 🔑 Step 3: Enable Email Authentication

Your app uses email/password authentication.

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Find **Email** provider
3. Make sure it's **Enabled** (toggle should be green)
4. **Disable "Confirm email"** for testing (optional but recommended for development):
   - This is already handled in the code with `email_confirm: true`
   - But you can also disable it in Settings → Auth → Email Auth → Uncheck "Enable email confirmations"

---

## 🧪 Step 4: Test the Setup

### Test the Edge Function:

1. Go to **Edge Functions** → **server** in Supabase
2. Click **Invoke Function**
3. Set path to: `/make-server-91171845/health`
4. Method: `GET`
5. Click **Run**
6. You should see: `{"status": "ok"}`

### Test in your app:

1. Open your Vibe OS app
2. Open browser console (F12)
3. Try to sign up with a new account
4. Watch the console for logs:
   - Should see `[API] Fetching user data from backend...`
   - Should see `[LOAD] User data loaded successfully`
5. Add a task and watch for:
   - `[AUTO-SAVE] Tasks changed...`
   - `[API] Saving 1 tasks to backend...`
   - `✓ Data saved successfully`

---

## 🔍 Troubleshooting

### Issue: "Failed to fetch data" or network errors

**Check 1: Verify environment variables are set**
- The app should already have these secrets configured
- But you can verify in Supabase Dashboard → Edge Functions → server → Settings

**Check 2: Verify the edge function is deployed**
```bash
supabase functions list
```
You should see `server` in the list.

**Check 3: Check Edge Function logs**
- Go to Edge Functions → server → Logs
- Look for errors when you try to save data
- Common errors:
  - "relation kv_store_91171845 does not exist" → You need to create the table (Step 1)
  - "Invalid token" → Authentication issue

### Issue: Data not persisting after logout

**Check 1: Console logs**
- Open browser console (F12)
- Look for save confirmations before logout:
  - `Saving all data before logout...`
  - `[API] Tasks saved successfully`
  - `All data saved, signing out...`

**Check 2: Database table**
- Go to Database → Tables → kv_store_91171845
- Click to view data
- You should see rows like:
  - `user:YOUR_USER_ID:tasks`
  - `user:YOUR_USER_ID:logs`
- If these rows exist, your data IS being saved

**Check 3: Check for errors**
- Look in console for red error messages
- Check Edge Function logs for backend errors

### Issue: "Unauthorized" errors

**Solution:**
- Make sure you're logged in
- Try logging out and back in
- Check that Email auth is enabled in Supabase

---

## 📊 Viewing Your Saved Data

To see what data is actually saved in Supabase:

1. Go to **Database** → **Tables** → `kv_store_91171845`
2. You'll see rows with keys like:
   - `user:abc123:tasks` - Your tasks
   - `user:abc123:logs` - Your victories
   - `user:abc123:settings` - Your settings
   - `user:abc123:timer` - Your timer state
   - `user:abc123:timer_sessions` - Your focus sessions
3. Click on a row to see the JSON value

---

## ✅ Success Checklist

- [ ] Database table `kv_store_91171845` created
- [ ] Edge function `server` deployed and active
- [ ] Email authentication enabled
- [ ] Health check endpoint returns `{"status": "ok"}`
- [ ] Can sign up and sign in
- [ ] Console shows successful data saves
- [ ] Data persists after logout and login

---

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** (F12) for detailed error logs
2. **Check Edge Function logs** in Supabase Dashboard
3. **Verify your Supabase project is active** (not paused)
4. **Try the test sequence**:
   - Sign up with a new email
   - Add one task
   - Wait 2 seconds (watch console)
   - Logout (watch console)
   - Login again
   - Check if task is still there

Share the console logs if you need help debugging!
