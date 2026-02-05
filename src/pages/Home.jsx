import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Restaurant', 'Hotel', 'Bar', 'Experience'];

    useEffect(() => {
        fetchPlaces();
    }, []);

    async function fetchPlaces() {
        setLoading(true);
        const { data, error } = await supabase
            .from('places')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching places:', error);
        else setPlaces(data);
        setLoading(false);
    }

    const filteredPlaces = filter === 'All'
        ? places
        : places.filter(p => p.category === filter);

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p style={{ letterSpacing: '0.2em', opacity: 0.5 }} className="serif">Loading selection...</p>
        </div>
    );

    return (
        <div className="container fade-in">
            <header style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>Selected.</h1>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                    LA PERSONAL LIST DEL LUSSO SILENZIOSO.
                </p>
            </header>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                overflowX: 'auto',
                paddingBottom: '3rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                justifyContent: 'center'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: filter === cat ? 'var(--ivory)' : 'rgba(245, 245, 240, 0.4)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease',
                            borderBottom: filter === cat ? '1px solid var(--ivory)' : '1px solid transparent',
                            paddingBottom: '4px'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gap: '4rem', paddingBottom: '4rem' }}>
                {filteredPlaces.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5 }}>Nessun posto trovato in questa categoria.</p>
                ) : (
                    filteredPlaces.map(place => (
                        <Link key={place.id} to={`/place/${place.id}`}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                style={{ position: 'relative' }}
                            >
                                <div style={{
                                    aspectRatio: '16/9',
                                    overflow: 'hidden',
                                    backgroundColor: '#1A1A1A'
                                }}>
                                    <img
                                        src={place.hero_image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000'}
                                        alt={place.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                    />
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{place.name}</h2>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: '0.4rem 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {place.city} {place.neighborhood ? `— ${place.neighborhood}` : ''}
                                        </p>
                                    </div>
                                    <span className="selected-badge">Selected</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
