const url = 'https://rgkdwlzsicojslznilgr.supabase.co/rest/v1/places?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNovanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

async function testFetch() {
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });
        const data = await res.json();
        console.log("STATUS:", res.status);
        console.log("DATA:", data);
    } catch (e) {
        console.log("FETCH_ERROR:", e.message);
    }
}
testFetch();
