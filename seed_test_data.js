import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgkdwlzsicojslznilgr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNovanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CITIES = [
    { name: 'Roma', lat: 41.9028, lng: 12.4964 },
    { name: 'Milano', lat: 45.4642, lng: 9.1900 },
    { name: 'Firenze', lat: 43.7696, lng: 11.2558 },
    { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
    { name: 'Venezia', lat: 45.4408, lng: 12.3155 },
    { name: 'Torino', lat: 45.0703, lng: 7.6869 },
    { name: 'Palermo', lat: 38.1157, lng: 13.3615 },
    { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
    { name: 'Bari', lat: 41.1171, lng: 16.8719 },
    { name: 'Verona', lat: 45.4384, lng: 10.9916 },
    { name: 'Genova', lat: 44.4056, lng: 8.9463 },
    { name: 'Taormina', lat: 37.8516, lng: 15.2853 },
    { name: 'Portofino', lat: 44.3039, lng: 9.2091 },
    { name: 'Gaeta', lat: 41.2092, lng: 13.5786 },
    { name: 'Cortina d\'Ampezzo', lat: 46.5378, lng: 12.1337 },
    { name: 'Capri', lat: 40.5471, lng: 14.2407 },
    { name: 'Positano', lat: 40.6273, lng: 14.4850 },
    { name: 'Porto Cervo', lat: 41.1333, lng: 9.5333 }
];

const CATEGORIES = ['RESTAURANT', 'ROOFTOP', 'HOTEL', 'BREAKFAST_BAR', 'COCKTAIL_BAR'];

const NAME_PREFIXES = ['Il', 'La', 'Antica', 'Nuova', 'Villa', 'Palazzo', 'Terrazza', 'Corte', 'Officina', 'Locanda', 'Trattoria', 'Boutique'];
const NAME_SUFFIXES = ['Smeraldo', 'Oro', 'Diamante', 'Fiori', 'Vino', 'Sorelle', 'Amici', 'Mare', 'Monti', 'Luna', 'Sole', 'Stelle', 'Sogno'];

const IMAGES = {
    RESTAURANT: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
    ROOFTOP: 'https://images.unsplash.com/photo-1513504381318-13620211bab2',
    HOTEL: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    BREAKFAST_BAR: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    COCKTAIL_BAR: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'
};

function generatePlace(index) {
    const city = CITIES[index % CITIES.length];
    const category = CATEGORIES[index % CATEGORIES.length];

    // Add small random offset to coordinates
    const lat = city.lat + (Math.random() - 0.5) * 0.05;
    const lng = city.lng + (Math.random() - 0.5) * 0.05;

    const name = `${NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]} ${NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]} ${index}`;

    return {
        name,
        category,
        city: city.name,
        address: `Via del Test ${index}`,
        latitude: lat,
        longitude: lng,
        status: 'ACTIVE',
        price_range: ['€€', '€€€', '€€€€'][Math.floor(Math.random() * 3)],
        description: `Un luogo esclusivo nel cuore di ${city.name}. Perfetto per testare le funzionalità di mappa e ricerca. Atmosfera premium e servizio eccellente.`,
        hero_image: `${IMAGES[category]}?auto=format&fit=crop&w=800&q=60&sig=${index}`,
        tags: [category.toLowerCase().replace('_', ' '), 'Test', 'Italy'],
        vibe_tags: ['Elegante', 'Premium', 'Esclusivo'],
        cuisine_type: category === 'RESTAURANT' ? ['Italiana', 'Innovativa'] : [],
        ai_knowledge_base: 'Questo è un luogo generato automaticamente per test interni. Non è un locale reale.'
    };
}

async function seed() {
    console.log("Starting seeding process...");
    const TOTAL = 500;
    const BATCH_SIZE = 50;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batch = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            if (i + j < TOTAL) {
                batch.push(generatePlace(i + j));
            }
        }

        console.log(`Inserting batch ${i / BATCH_SIZE + 1}...`);
        const { error } = await supabase.from('places').insert(batch);

        if (error) {
            console.error(`Error inserting batch: ${error.message}`);
            break;
        }
    }

    console.log("Seeding complete!");
}

seed();
