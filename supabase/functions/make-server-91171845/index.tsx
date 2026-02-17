import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to get authenticated user ID
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('No access token provided in Authorization header');
      return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log(`Auth error while verifying user: ${error.message}`);
      return null;
    }
    
    if (!user?.id) {
      console.log('No user ID found from token');
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.log(`Exception in getAuthenticatedUserId: ${error}`);
    return null;
  }
}

// Health check endpoint (public)
app.get("/make-server-91171845/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint (public)
app.post("/make-server-91171845/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Vibe User' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    console.log(`User created successfully: ${data.user?.id}`);
    return c.json({ 
      success: true, 
      userId: data.user?.id,
      message: 'Account created successfully!' 
    });
  } catch (error) {
    console.log(`Exception in signup endpoint: ${error}`);
    return c.json({ error: 'Signup failed. Please try again.' }, 500);
  }
});

// Get all user data (protected)
app.get("/make-server-91171845/data", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    // Fetch all user data from KV store
    const keys = [
      `user:${userId}:tasks`,
      `user:${userId}:logs`,
      `user:${userId}:timer_sessions`,
      `user:${userId}:settings`,
      `user:${userId}:timer`,
      `user:${userId}:horse_reveal_shuffle`,
    ];
    
    const results = await kv.mget(keys);
    
    const data = {
      tasks: results[0] || [],
      logs: results[1] || [],
      timerSessions: results[2] || [],
      settings: results[3] || {
        projectName: 'NEON_DRIFTER_V2',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        targetProjects: 100,
        docsLink: 'https://docs.vibe-os.dev',
        ghLink: 'https://github.com/vibe-os',
        spotifyLink: 'https://spotify.com',
      },
      timer: results[4] || { totalSeconds: 0 },
      horseRevealShuffle: results[5] || null,
    };
    
    console.log(`Successfully fetched data for user: ${userId}`);
    return c.json(data);
  } catch (error) {
    console.log(`Exception in get data endpoint: ${error}`);
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});

// Save tasks (protected)
app.post("/make-server-91171845/tasks", async (c) => {
  console.log('=== TASKS ENDPOINT HIT ===');
  console.log('Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      console.log('User authentication failed - returning 401');
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { tasks } = body;
    
    await kv.set(`user:${userId}:tasks`, tasks);
    
    console.log(`Tasks saved for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save tasks endpoint: ${error}`);
    return c.json({ error: 'Failed to save tasks' }, 500);
  }
});

// Save logs (protected)
app.post("/make-server-91171845/logs", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { logs } = body;
    
    await kv.set(`user:${userId}:logs`, logs);
    
    console.log(`Logs saved for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save logs endpoint: ${error}`);
    return c.json({ error: 'Failed to save logs' }, 500);
  }
});

// Save settings (protected)
app.post("/make-server-91171845/settings", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { settings } = body;
    
    await kv.set(`user:${userId}:settings`, settings);
    
    console.log(`Settings saved for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save settings endpoint: ${error}`);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

// Save timer (protected)
app.post("/make-server-91171845/timer", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { totalSeconds } = body;
    
    await kv.set(`user:${userId}:timer`, { totalSeconds });
    
    console.log(`Timer saved for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save timer endpoint: ${error}`);
    return c.json({ error: 'Failed to save timer' }, 500);
  }
});

// Save horse reveal shuffle (protected)
app.post("/make-server-91171845/horse-shuffle", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { shuffle } = body;
    
    await kv.set(`user:${userId}:horse_reveal_shuffle`, shuffle);
    
    console.log(`Horse reveal shuffle saved for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save horse shuffle endpoint: ${error}`);
    return c.json({ error: 'Failed to save horse shuffle' }, 500);
  }
});

// Save timer sessions (protected)
app.post("/make-server-91171845/timer-sessions", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please sign in' }, 401);
    }
    
    const body = await c.req.json();
    const { timerSessions } = body;
    
    await kv.set(`user:${userId}:timer_sessions`, timerSessions);
    
    console.log(`Timer sessions saved for user: ${userId}, count: ${timerSessions?.length || 0}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Exception in save timer sessions endpoint: ${error}`);
    return c.json({ error: 'Failed to save timer sessions' }, 500);
  }
});

Deno.serve(app.fetch);
