import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const PlaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlace();
        window.scrollTo(0, 0);
    }, [id]);

    async function fetchPlace() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setPlace(data);
        } catch (err) {
            console.error("Fetch place error:", err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div style={{ backgroundColor: '#2D080C', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: 'var(--ivory)', letterSpacing: '0.4em', fontSize: '0.8rem', fontFamily: 'serif' }}>
                THE LIST
            </div>
        </div>
    );

    if (!place) return null;

    return (
        <div className="app-shell" style={{ background: 'transparent', color: 'var(--ivory)' }}>

            {/* Immersive Header */}
            <div style={{ position: 'relative', height: '65vh', overflow: 'hidden' }}>
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ duration: 1.2 }}
                    src={place.hero_image}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, var(--bordeaux-deep))'
                }} />

                <Link to="/" style={{
                    position: 'absolute',
                    top: '3rem',
                    left: '2rem',
                    fontSize: '0.55rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--ivory)',
                    zIndex: 10,
                    textDecoration: 'none',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    backdropFilter: 'blur(5px)'
                }}>
                    ← Archive
                </Link>
            </div>

            {/* Content Section */}
            <div className="luxury-container" style={{ marginTop: '-5vh', position: 'relative', paddingBottom: '12rem', zIndex: 1, paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="selected-badge" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', marginBottom: '1.5rem' }}>SELECTED</div>

                    <h1 className="serif" style={{ fontSize: '2.8rem', margin: '0 0 1rem 0', lineHeight: 1.1, fontWeight: 200 }}>
                        {place.name}
                    </h1>

                    <p className="place-location" style={{ marginBottom: '4rem', opacity: 0.6 }}>
                        {place.city} — {place.neighborhood || place.category}
                    </p>

                    <div style={{ width: '40px', height: '1px', background: 'var(--gold)', marginBottom: '5rem', opacity: 0.4 }}></div>

                    <div style={{ display: 'grid', gap: '5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '2rem', color: 'var(--grey-warm)' }}>Editor's Note</h3>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, fontWeight: 300, fontFamily: 'serif', fontStyle: 'italic', opacity: 0.9 }}>
                                {place.description || "A sanctuary of quiet luxury, where every detail has been curated to offer a refuge from the mundane."}
                            </p>
                        </div>

                        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '4rem' }}>
                            <h3 style={{ fontSize: '0.55rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '3rem', color: 'var(--grey-warm)' }}>Information</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '2rem' }}>
                                <li>
                                    <span style={{ display: 'block', fontSize: '0.5rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Location</span>
                                    <span style={{ fontSize: '0.9rem' }}>{place.address || 'Confidential'}</span>
                                </li>
                                <li>
                                    <span style={{ display: 'block', fontSize: '0.5rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>District</span>
                                    <span style={{ fontSize: '0.9rem' }}>{place.neighborhood || 'Central'}</span>
                                </li>
                            </ul>

                            {place.website && (
                                <a href={place.website} target="_blank" rel="noopener noreferrer" className="luxury-button" style={{ marginTop: '5rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                    Visit Website
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PlaceDetails;
