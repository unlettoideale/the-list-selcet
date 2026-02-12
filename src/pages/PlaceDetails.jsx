import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, ExternalLink, Star, Heart } from 'lucide-react';
import { CATEGORY_LABELS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const PlaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => { fetchPlace(); window.scrollTo(0, 0); }, [id]);

    async function fetchPlace() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('places').select('*').eq('id', id).single();
            if (error) throw error;
            setPlace(data);
            // Track recently viewed
            try {
                const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const filtered = stored.filter(p => p.id !== data.id);
                const entry = { id: data.id, name: data.name, hero_image: data.hero_image, city: data.city, category: data.category };
                localStorage.setItem('recentlyViewed', JSON.stringify([entry, ...filtered].slice(0, 10)));
            } catch (e) { }
        } catch (err) { console.error("Fetch place error:", err); navigate('/'); }
        finally { setLoading(false); }
    }

    if (loading) return (
        <div style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: 'var(--accent)', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    if (!place) return null;

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

            {/* Hero Image */}
            <div style={{ position: 'relative', height: '55vh', overflow: 'hidden' }}>
                <motion.img
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    src={place.hero_image} alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(249,245,246,0.5) 85%, #F9F5F6 100%)'
                }} />

                {/* Back Button */}
                <Link to="/" style={{
                    position: 'absolute', top: '2.5rem', left: '1.2rem',
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', color: 'var(--text-primary)', zIndex: 10,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <ArrowLeft size={18} />
                </Link>

                {/* Favorite Button */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(place.id)}
                    style={{
                        position: 'absolute', top: '2.5rem', right: '1.2rem',
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)', zIndex: 10, cursor: 'pointer', border: 'none',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                    }}>
                    <Heart size={18} fill={isFavorite(place.id) ? "var(--accent)" : "transparent"} color={isFavorite(place.id) ? "var(--accent)" : "var(--text-primary)"} />
                </motion.button>

                {/* Category badge */}
                <div style={{
                    position: 'absolute', top: '5.5rem', right: '1.2rem',
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
                    padding: '0.35rem 0.8rem', borderRadius: '20px',
                    fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em',
                    color: 'var(--text-primary)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    {place.category} {place.price_range && `· ${place.price_range}`}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '450px', margin: '-3rem auto 0', position: 'relative', zIndex: 1, padding: '0 1.5rem', paddingBottom: '10rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>

                    {/* Selected badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                        <Star size={12} color="var(--bronze)" fill="var(--bronze)" />
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--bronze)' }}>CURATED SELECTION</span>
                    </div>

                    <h1 className="serif" style={{ fontSize: '2.2rem', margin: '0 0 0.5rem', lineHeight: 1.1, fontWeight: 400, color: 'var(--text-primary)' }}>
                        {place.name}
                    </h1>

                    {/* New Category & Tags Display */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 600,
                            textTransform: 'uppercase', color: 'var(--accent)',
                            background: 'var(--accent-soft)', padding: '0.3rem 0.6rem', borderRadius: '6px'
                        }}>
                            {CATEGORY_LABELS[place.category] || place.category}
                        </span>
                        {place.price_range && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--bronze)', letterSpacing: '0.05em' }}>{place.price_range}</span>
                        )}
                    </div>

                    {place.tags && place.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {place.tags.map(tag => (
                                <span key={tag} style={{
                                    background: 'var(--bg-subtle)', padding: '0.25rem 0.5rem', borderRadius: '4px',
                                    fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em'
                                }}>{tag}</span>
                            ))}
                        </div>
                    )}

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {place.city} — {place.neighborhood || place.address}
                    </p>

                    <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, var(--accent), var(--bronze))', marginBottom: '2rem', borderRadius: '2px' }} />
                </motion.div>

                {/* Editor's Note */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
                    <h3 style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Editor's Note</h3>
                    <p className="serif" style={{ fontSize: '1.05rem', lineHeight: 1.9, fontWeight: 400, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
                        {place.description || "A sanctuary of quiet luxury, where every detail has been curated to offer a refuge from the mundane."}
                    </p>
                </motion.div>

                {/* Information */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}>
                    <div style={{
                        background: 'var(--bg-elevated)', borderRadius: '16px', padding: '1.5rem',
                        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h3 style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>Informazioni</h3>
                        <div style={{ display: 'grid', gap: '1.2rem' }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>Indirizzo</span>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{place.address || 'Confidential'}</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)' }} />
                            <div>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>Quartiere</span>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{place.neighborhood || 'Central'}</span>
                            </div>
                        </div>
                    </div>

                    {place.website && (
                        <a href={place.website} target="_blank" rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                marginTop: '1.5rem', padding: '1rem', borderRadius: '14px',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                                color: '#FFFFFF', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                boxShadow: '0 4px 16px rgba(128,0,32,0.25)',
                                transition: 'all 0.3s ease'
                            }}>
                            <ExternalLink size={14} /> Visita il Sito
                        </a>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PlaceDetails;
