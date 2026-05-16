const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read url and key from supabase.js since they are hardcoded there
const supabaseUrl = 'https://rgkdwlzsicojslznilgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNvanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGaeta() {
    console.log("Searching for places in Gaeta...");
    const { data, error } = await supabase
        .from('places')
        .select('name, city, status, latitude, longitude')
        .ilike('city', 'Gaeta');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Found:", JSON.stringify(data, null, 2));
}

checkGaeta();
