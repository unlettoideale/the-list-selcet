import { createClient } from '@supabase/supabase-js'

// EMERGENCY FIX: Hardcoded credentials to bypass Vercel env issues immediately
const supabaseUrl = 'https://rgkdwlzsicojslznilgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNvanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

let supabase;
try {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase URL or Key missing.');
        supabase = {
            from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'No Auth' }) }) }), insert: () => ({}) }),
            auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), getSession: async () => ({ data: { session: null } }) }
        };
    } else {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (e) {
    console.error('Supabase init failed', e);
    // Fallback dummy
    supabase = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Init Failed' }) }) }) }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            getSession: async () => ({ data: { session: null } }),
            signInWithPassword: async () => ({ error: { message: 'Init Failed' } })
        }
    };
}

export { supabase };
