import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-91171845`;

// Create singleton Supabase client for auth
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Get access token from current session
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Sign up new user
export async function signUp(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  return response.json();
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

// Get all user data
export async function getUserData() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/data`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch data';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      console.error(`getUserData failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('getUserData network error:', error);
    throw error;
  }
}

// Save tasks
export async function saveTasks(tasks: any[]) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save tasks';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Silently fail for tasks to avoid spam
    throw error;
  }
}

// Save logs
export async function saveLogs(logs: any[]) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ logs }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save logs';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Silently fail for logs to avoid spam
    throw error;
  }
}

// Save settings
export async function saveSettings(settings: any) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save settings';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Silently fail for settings to avoid spam
    throw error;
  }
}

// Save timer
export async function saveTimer(totalSeconds: number) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/timer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ totalSeconds }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save timer';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      console.error(`saveTimer failed: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('saveTimer network error:', error);
    throw error;
  }
}

// Save horse reveal shuffle
export async function saveHorseShuffle(shuffle: number[]) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/horse-shuffle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ shuffle }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save horse shuffle';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Silently fail for horse shuffle to avoid spam
    throw error;
  }
}

// Save timer sessions
export async function saveTimerSessions(timerSessions: any[]) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/timer-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ timerSessions }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save timer sessions';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Silently fail to avoid spam
    throw error;
  }
}
