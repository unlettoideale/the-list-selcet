Write-Host "--- INIZIO CONFIGURAZIONE SICUREZZA VERCEL ---" -ForegroundColor Cyan
Write-Host "Se ti chiede 'Mark as sensitive? (y/N)', rispondi n (o N)" -ForegroundColor Yellow
Write-Host "Se ti chiede 'Add to other environments?', rispondi n (o N)" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

# 1. Rimuovi vecchie (ignorando errori)
npx vercel env rm VITE_SUPABASE_URL production -y
npx vercel env rm VITE_SUPABASE_ANON_KEY production -y

# 2. Aggiungi URL
Write-Host "`nAggiungo URL Supabase (rispondi 'n' alle domande)..." -ForegroundColor Green
echo "https://rgkdwlzsicojslznilgr.supabase.co" | npx vercel env add VITE_SUPABASE_URL production

# 3. Aggiungi Chiave Anomima
Write-Host "`nAggiungo Chiave Segreta (rispondi 'n' alle domande)..." -ForegroundColor Green
$key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJna2R3bHpzaWNvanNsem5pbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjI3MjIsImV4cCI6MjA4NTg5ODcyMn0.ysDwpoXa4_U6vEUZfX--J-FG6ZYuEATJQGr0I9qPZjw"
echo $key | npx vercel env add VITE_SUPABASE_ANON_KEY production

# 4. Deploy Finale
Write-Host "`nLancio il Deploy Finale (automatico)..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host "`n--- FATTO! Sito aggiornato. ---" -ForegroundColor Cyan
