import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgkdwlzsicojslznilgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNovanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCiro() {
    console.log("Checking for 'Ciro' in Gaeta...");
    const { data, error } = await supabase
        .from('places')
        .select('name, city, status, id')
        .ilike('name', '%Ciro%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("DB Result:", JSON.stringify(data, null, 2));
}

checkCiro();
