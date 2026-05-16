import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgkdwlzsicojslznilgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNovanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRecentPlaces() {
    console.log("Fetching last 5 places...");
    const { data, error } = await supabase
        .from('places')
        .select('name, city, status, id, latitude, longitude, category')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.log("DB_ERROR:" + error.message);
    } else {
        console.log("DB_RESULT:" + JSON.stringify(data, null, 2));
    }
}

checkRecentPlaces();
