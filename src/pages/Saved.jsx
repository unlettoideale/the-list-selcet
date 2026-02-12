import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Heart, Navigation, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFavorites } from '../hooks/useFavorites';
import { CATEGORY_LABELS } from '../constants';

const Saved = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchSavedPlaces();
    }, [favorites]); // Re-fetch logic if favorites change (though mostly we filter locally if we have all)

    async function fetchSavedPlaces() {
        if (favorites.length === 0) {
            setPlaces([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .in('id', favorites)
                .eq('status', 'ACTIVE');

            if (error) throw error;
            setPlaces(data || []);
        } catch (err) {
            console.error("Error fetching saved places:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div style={{ background: '#F7F2EE', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: '#9B3A4A', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F7F2EE', color: '#1A1A1A', paddingBottom: '100px' }}>
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ padding: '2.5rem 1.5rem 1rem' }}
            >
                <h1 style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, color: '#8A8478', margin: 0 }}>
                    Salvati ({places.length})
                </h1>
            </motion.header>

            <main style={{ padding: '0 1rem' }}>
                {places.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ textAlign: 'center', paddingTop: '6rem', maxWidth: '450px', margin: '0 auto' }}
                    >
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            background: 'rgba(155,58,74,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Bookmark size={26} style={{ color: '#B5AEA5' }} />
                        </div>
                        <h2 className="serif" style={{ fontSize: '1.3rem', fontWeight: 400, margin: '0 0 0.5rem', color: '#1A1A1A' }}>
                            La tua collezione è vuota
                        </h2>
                        <p style={{ fontSize: '0.7rem', color: '#8A8478', lineHeight: 1.6 }}>
                            Salva i tuoi luoghi preferiti per averli sempre a portata di mano.
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <AnimatePresence mode="popLayout">
                            {places.map((place) => (
                                <Link key={place.id} to={`/place/${place.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            display: 'flex', gap: '1rem', padding: '0.8rem',
                                            background: '#FFFFFF', borderRadius: '16px',
                                            border: '1px solid rgba(0,0,0,0.04)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                            alignItems: 'center', position: 'relative'
                                        }}
                                    >
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#EDE5DF' }}>
                                            {place.hero_image ? (
                                                <img src={place.hero_image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                                    <Navigation size={24} color="#9B3A4A" />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className="serif" style={{ fontSize: '1.1rem', fontWeight: 500, margin: '0 0 0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</h3>
                                            <p style={{ fontSize: '0.6rem', color: '#8A8478', margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <MapPin size={11} /> {place.city}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B3A4A', fontWeight: 600 }}>
                                                    {CATEGORY_LABELS[place.category] || place.category}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFavorite(place.id);
                                            }}
                                            style={{
                                                position: 'absolute', top: '0.8rem', right: '0.8rem',
                                                background: 'rgba(255,255,255,0.9)', borderRadius: '50%',
                                                width: '32px', height: '32px', border: 'none',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <Heart size={16} fill="#9B3A4A" color="#9B3A4A" />
                                        </button>
                                    </motion.div>
                                </Link>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Saved;

