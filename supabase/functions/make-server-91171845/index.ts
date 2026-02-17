import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

// 1. Define CORS headers for the manual OPTIONS handler
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable Hono CORS middleware as a secondary layer
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-client-info", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to get authenticated user ID using custom secrets
async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  try {
    const supabase = createClient(
      // Use the canonical Supabase project URL and service role key
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

// Health check endpoint
app.get("/make-server-91171845/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint using custom secrets
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
      email_confirm: true
    });
    
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ 
      success: true, 
      userId: data.user?.id,
      message: 'Account created successfully!' 
    });
  } catch (error) {
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get all user data
app.get("/make-server-91171845/data", async (c) => {
  try {
    const userId = await getAuthenticatedUserId(c.req.raw);
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);
    
    const keys = [
      `user:${userId}:tasks`,
      `user:${userId}:logs`,
      `user:${userId}:timer_sessions`,
      `user:${userId}:settings`,
      `user:${userId}:timer`,
      `user:${userId}:horse_reveal_shuffle`,
    ];
    
    const results = await kv.mget(keys);
    
    return c.json({
      tasks: results[0] || [],
      logs: results[1] || [],
      timerSessions: results[2] || [],
      settings: results[3] || {
        projectName: 'NEON_DRIFTER_V2',
        startDate: new Date().toISOString().split('T')[0],
        targetProjects: 100,
        docsLink: 'https://docs.vibe-os.dev',
        ghLink: 'https://github.com/vibe-os',
        spotifyLink: 'https://spotify.com',
      },
      timer: results[4] || { totalSeconds: 0 },
      horseRevealShuffle: results[5] || null,
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});

// Generic save endpoints
app.post("/make-server-91171845/tasks", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { tasks } = await c.req.json();
  await kv.set(`user:${userId}:tasks`, tasks);
  return c.json({ success: true });
});

app.post("/make-server-91171845/logs", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { logs } = await c.req.json();
  await kv.set(`user:${userId}:logs`, logs);
  return c.json({ success: true });
});

app.post("/make-server-91171845/settings", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { settings } = await c.req.json();
  await kv.set(`user:${userId}:settings`, settings);
  return c.json({ success: true });
});

app.post("/make-server-91171845/timer", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { totalSeconds } = await c.req.json();
  await kv.set(`user:${userId}:timer`, { totalSeconds });
  return c.json({ success: true });
});

app.post("/make-server-91171845/horse-shuffle", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { shuffle } = await c.req.json();
  await kv.set(`user:${userId}:horse_reveal_shuffle`, shuffle);
  return c.json({ success: true });
});

app.post("/make-server-91171845/timer-sessions", async (c) => {
  const userId = await getAuthenticatedUserId(c.req.raw);
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  const { timerSessions } = await c.req.json();
  await kv.set(`user:${userId}:timer_sessions`, timerSessions);
  return c.json({ success: true });
});

// 2. Final wrapper to handle OPTIONS preflight manually
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return app.fetch(req);
});
