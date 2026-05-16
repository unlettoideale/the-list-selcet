import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function upgradeDatabase() {
    console.log("Inizio aggiornamento della struttura del database per l'AI Super Premium...");

    // Stiamo usando Supabase RPC (se definito) oppure chiamate SQL dirette se abilitate.
    // Dato che Supabase JS client non può fare ALTER TABLE dal client anon/service senza una policy particolare,
    // Proviamo a creare una Row inserendo i nuovi campi. Se fallisce perché le colonne non esistono, 
    // daremo le istruzioni SQL manuali da incollare nell'SQL Editor di Supabase.

    const testPlace = {
        name: "Test AI Place",
        category: "RESTAURANT",
        city: "Milano",
        status: "DRAFT",
        // Nuovi campi Super Premium:
        ai_description: "Un test segreto per l'AI.",
        cuisine_type: ["Sushi", "Fusion"],
        vibe_tags: ["Romantico", "Intimo", "Vista", "Esclusivo"],
        must_order: "Black Cod",
        ideal_for: ["Anniversario", "Business Dinner"],
        ai_knowledge_base: "Il locale ha una vista a 360 gradi sulla città. Il prezzo medio è di 150€ a persona. È richiesto dress code elegante (no shorts, no open shoes per gli uomini). Si consiglia di prenotare con 3 settimane di anticipo per assicurarsi il tavolo d'angolo 12, che ha il miglior tramonto. Musica dal vivo jazz ogni giovedì sera. Hanno opzioni gluten-free ma non hanno un menu degustazione vegano specifico.",
        instagram_url: "https://instagram.com/test",
        website_url: "https://test.com",
        menu_url: "https://test.com/menu.pdf"
    };

    const { error } = await supabase.from('places').insert([testPlace]);

    if (error) {
        console.error("\n❌ ERRORE: Il database non ha ancora le nuove colonne per l'Intelligenza Artificiale!");
        console.error("Dobbiamo aggiungere i campi. Dato che non posso modificare la struttura del database da questo script per motivi di sicurezza di Supabase, devi eseguire tu un comando SQL.");
        console.log("\n👇 VAI SULLA TUA DASHBOARD SUPABASE -> SQL EDITOR -> NEW QUERY, INCOLLA ED ESEGUI QUESTO CODICE: 👇\n");
        console.log(`
-- Aggiunge campi per l'ecosistema AI Super Premium
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS cuisine_type text[],
ADD COLUMN IF NOT EXISTS vibe_tags text[],
ADD COLUMN IF NOT EXISTS must_order TEXT,
ADD COLUMN IF NOT EXISTS ideal_for text[],
ADD COLUMN IF NOT EXISTS ai_knowledge_base TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS menu_url TEXT;

-- Crea un indice per facilitare la ricerca dell'AI (opzionale ma consigliato per performance future)
-- CREATE INDEX IF NOT EXISTS idx_places_vibe ON public.places USING GIN (vibe_tags);
        `);
    } else {
        console.log("\n✅ Il database ha già la struttura aggiornata! Ha accettato il locale di test.");
        // Rimuoviamo il locale di test
        await supabase.from('places').delete().eq('name', 'Test AI Place');
    }
}

upgradeDatabase();
