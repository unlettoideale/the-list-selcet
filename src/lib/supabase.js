import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''


let supabase;
try {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase URL or Key missing. Check .env.local');
        // Create a dummy client to prevent crash, requests will fail but app runs
        supabase = {
            from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'No Auth' }) }) }), insert: () => ({}) }),
            auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), getSession: async () => ({ data: { session: null } }) }
        };
    } else {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (e) {
    console.error('Supabase init failed', e);
    supabase = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Init Failed' }) }) }) }),
        auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }), getSession: async () => ({ data: { session: null } }) }
    };
}

export { supabase };
