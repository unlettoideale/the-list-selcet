import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyLine = envContent.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY='));
if (keyLine) {
    const rawValue = keyLine.split('=')[1];
    console.log("Raw Value length:", rawValue.length);
    console.log("Last 10 chars hex:", Buffer.from(rawValue.slice(-10)).toString('hex'));
    const trimmed = rawValue.trim();
    console.log("Trimmed length:", trimmed.length);
    console.log("Trimmed hex:", Buffer.from(trimmed).toString('hex'));
} else {
    console.log("Key not found");
}
