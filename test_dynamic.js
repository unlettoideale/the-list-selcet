import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Try to read from .env.local dynamically
const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : '';

console.log("Using URL:", supabaseUrl);
console.log("Key length:", supabaseAnonKey.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing reachability...");
    const { data, error } = await supabase.from('places').select('name').limit(1);
    if (error) {
        console.log("ERROR:", error.message);
    } else {
        console.log("SUCCESS! Got 1 place:", data);
    }
}
test();
