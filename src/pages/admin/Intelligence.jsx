import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Plus, MapPin, Users, Bookmark, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Intelligence = () => {
    const [stats, setStats] = useState([
        { id: 'vault', label: 'Voci nel Vault', value: '0', icon: MapPin },
        { id: 'saves', label: 'Salvati dai Membri', value: '0', icon: Bookmark },
        { id: 'categories', label: 'Categorie Attive', value: '0', icon: FileText },
    ]);
    const [recentPlaces, setRecentPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    async function fetchAdminData() {
        try {
            setLoading(true);

            // 1. Conteggio Luoghi Reali
            const { count: placesCount } = await supabase
                .from('places')
                .select('*', { count: 'exact', head: true });

            // 2. Conteggio Salvataggi (se esiste la tabella saved_places, altrimenti 0)
            let savedCount = 0;
            try {
                const { count } = await supabase
                    .from('saved_places')
                    .select('*', { count: 'exact', head: true });
                savedCount = count || 0;
            } catch (e) {
                // Tabella non ancora creata o non accessibile
                savedCount = 0;
            }

            // 3. Conteggio Categorie Distinte
            const { data: catData } = await supabase
                .from('places')
                .select('category');

            const uniqueCategories = new Set(catData?.map(p => p.category).filter(Boolean));

            setStats([
                { id: 'vault', label: 'Voci nel Vault', value: (placesCount || 0).toString(), icon: MapPin },
                { id: 'saves', label: 'Salvati dai Membri', value: savedCount.toString(), icon: Bookmark },
                { id: 'categories', label: 'Categorie Attive', value: uniqueCategories.size.toString(), icon: FileText },
            ]);

            // 4. Attività Recente Reale
            const { data: placesData } = await supabase
                .from('places')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (placesData) setRecentPlaces(placesData);

        } catch (err) {
            console.error("Errore fetch admin:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        style={{
                            padding: '2.5rem',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid rgba(0,0,0,0.05)',
                            borderRadius: '4px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(93, 18, 25, 0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                                <stat.icon size={20} color="#5D1219" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2.2rem', fontWeight: 300, marginBottom: '0.5rem', color: '#1A0406' }}>{stat.value}</h3>
                        <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.5, fontWeight: 700 }}>{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Dashboard Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '4rem' }}>

                {/* Attività Recente */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 className="serif" style={{ fontSize: '1.6rem', color: '#1A0406' }}>Attività Recente</h3>
                        <Link to="/admin/places" style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: '#5D1219',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontWeight: 700
                        }}>
                            <Plus size={16} /> Nuovo Inserimento
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>Caricamento dati...</div>
                        ) : recentPlaces.length > 0 ? (
                            recentPlaces.map((place, idx) => (
                                <div key={place.id} style={{
                                    padding: '1.5rem 0',
                                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1A0406' }}>{place.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#A68966', fontWeight: 500 }}>{place.category}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(place.created_at).toLocaleDateString('it-IT')}</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '20px',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            color: '#10b981',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontWeight: 700
                                        }}>
                                            PUBBLICATO
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>Nessuna attività recente registrata.</div>
                        )}
                    </div>
                </section>

                {/* Scorciatoie */}
                <aside>
                    <h3 className="serif" style={{ fontSize: '1.6rem', marginBottom: '2.5rem', color: '#1A0406' }}>Azioni Rapide</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {[
                            { label: 'Bozza Newsletter', action: 'Draft Newsletter' },
                            { label: 'Aggiorna Mappa', action: 'Update Map Pins' },
                            { label: 'Revisione Membri', action: 'Review Members' },
                            { label: 'Esporta Report', action: 'Export Reports' }
                        ].map(item => (
                            <button key={item.label} style={{
                                padding: '1.2rem 1.5rem',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.08)',
                                color: '#1A0406',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: 500,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#5D1219';
                                    e.currentTarget.style.color = '#5D1219';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                                    e.currentTarget.style.color = '#1A0406';
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default Intelligence;
