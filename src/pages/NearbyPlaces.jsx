import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Navigation, X, Heart } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_TAGS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

export default function NearbyPlaces() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [category, setCategory] = useState('ALL');
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortBy, setSortBy] = useState('distance');
    const { isFavorite, toggleFavorite } = useFavorites();

    // If query exists, we are in "Search Mode" (Global). 
    // If NO query, we are in "Nearby Mode" (Radius limited).
    const isSearchMode = !!query;

    const getCategoryIcon = (cat) => null;

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPlaces();
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => { }
            );
        }
    }, [query]);

    // Reset tag when category changes
    useEffect(() => {
        setSelectedTag(null);
    }, [category]);

    // Auto-select category if query matches a label
    useEffect(() => {
        if (!query || !CATEGORY_LABELS) return;
        const lowerQ = query.trim().toLowerCase();

        // Find matching category key
        const matchedEntry = Object.entries(CATEGORY_LABELS).find(([key, label]) =>
            label.toLowerCase() === lowerQ ||
            (key === 'RESTAURANT' && (lowerQ === 'ristorante' || lowerQ === 'ristoranti')) || // Handle singular/plural
            (key === 'HOTEL' && lowerQ === 'hotel') ||
            (key === 'ROOFTOP' && (lowerQ === 'rooftop' || lowerQ === 'roof top'))
        );

        if (matchedEntry) {
            setCategory(matchedEntry[0]);
        }
    }, [query]);

    async function fetchPlaces() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('id, name, category, city, latitude, longitude, hero_image, price_range, tags')
                .eq('status', 'ACTIVE');
            if (error) throw error;
            setPlaces(data || []);
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoading(false); }
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const enrichedPlaces = useMemo(() => {
        return places
            .filter(p => p.latitude && p.longitude)
            .map(p => ({
                ...p,
                distance: userLocation ? getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude) : null
            }))
            .filter(p => {
                // STEP 1: Search Query Filter (Global Mode)
                if (isSearchMode) {
                    // Intelligent Search: Split query into terms
                    const terms = query.toLowerCase().split(' ').filter(t => t.trim());

                    // A place matches if EVERY term matches SOMETHING in the place (AND logic)
                    if (terms.length === 0) return true;

                    return terms.every(term => {
                        const matchesName = p.name?.toLowerCase().includes(term);
                        const matchesCity = p.city?.toLowerCase().includes(term);
                        const matchesTags = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(term));
                        const categoryLabel = (CATEGORY_LABELS && CATEGORY_LABELS[p.category]) || '';
                        const matchesCategory = categoryLabel.toLowerCase().includes(term);

                        return matchesName || matchesCity || matchesTags || matchesCategory;
                    });
                }
                // STEP 2: Nearby Mode (Radius Limit)
                // Only apply 10km limit if NOT searching
                return p.distance != null && p.distance <= 10;
            })
            .filter(p => category === 'ALL' || p.category === category)
            .filter(p => {
                // STEP 3: Tag Filter
                if (!selectedTag) return true;
                return Array.isArray(p.tags) && p.tags.includes(selectedTag);
            })
            .sort((a, b) => {
                if (sortBy === 'distance' && a.distance != null) return a.distance - b.distance;
                return (a.name || '').localeCompare(b.name || '');
            });
    }, [places, userLocation, isSearchMode, query, category, selectedTag, sortBy]);

    if (loading) return (
        <div style={{ background: '#F7F2EE', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: '#9B3A4A', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F7F2EE', color: '#1A1A1A', paddingBottom: '100px' }}>
            {/* Header */}
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                style={{ padding: '2rem 1.2rem 1rem', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(247,242,238,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate('/')}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)',
                            background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}>
                        <ArrowLeft size={16} color="#1A1A1A" />
                    </motion.button>
                    <div style={{ flex: 1 }}>
                        <h1 className="serif" style={{ fontSize: '1.4rem', fontWeight: 500, margin: 0 }}>
                            {isSearchMode ? `Risultati per "${query}"` : 'Vicino a Te'}
                        </h1>
                        <p style={{ fontSize: '0.55rem', color: '#B5AEA5', margin: 0 }}>
                            {enrichedPlaces.length} luoghi trovati {isSearchMode ? 'ovunque' : 'nel raggio di 10km'}
                        </p>
                    </div>
                    {isSearchMode && (
                        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate('/nearby')}
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(0,0,0,0.05)',
                                border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                cursor: 'pointer', fontSize: '0.6rem', color: '#1A1A1A', fontWeight: 500
                            }}>
                            <X size={12} /> Rimuovi filtri
                        </motion.button>
                    )}
                </div>

                {/* Category Filters */}
                {/* Category Filters */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {CATEGORIES && CATEGORIES.map(cat => (
                        <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.96 }}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: category === cat ? '1px solid #9B3A4A' : '1px solid rgba(0,0,0,0.06)',
                                background: category === cat ? '#9B3A4A' : '#FFFFFF',
                                color: category === cat ? '#FFFFFF' : '#1A1A1A',
                                fontSize: '0.65rem', fontWeight: 500,
                                letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.3s ease',
                                boxShadow: category === cat ? '0 4px 12px rgba(155,58,74,0.2)' : '0 1px 2px rgba(0,0,0,0.02)'
                            }}>
                            {(CATEGORY_LABELS && CATEGORY_LABELS[cat]) || cat}
                        </motion.button>
                    ))}
                </div>

                {/* Sub-Category / Tag Filters */}
                <AnimatePresence>
                    {category !== 'ALL' && CATEGORY_TAGS && CATEGORY_TAGS[category] && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="no-scrollbar"
                            style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingTop: '0.5rem', paddingBottom: '0.3rem' }}
                        >
                            {CATEGORY_TAGS[category].map(tag => (
                                <motion.button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        padding: '0.3rem 0.8rem', borderRadius: '20px',
                                        border: selectedTag === tag ? '1px solid #C4956A' : '1px solid rgba(0,0,0,0.08)',
                                        background: selectedTag === tag ? '#C4956A' : 'transparent',
                                        color: selectedTag === tag ? '#FFFFFF' : '#8A8478',
                                        fontSize: '0.55rem', fontWeight: 600,
                                        cursor: 'pointer', whiteSpace: 'nowrap',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {tag}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Places List */}
            <div style={{ padding: '0.5rem 1rem' }}>
                <AnimatePresence mode="popLayout">
                    {enrichedPlaces.map((place, idx) => (
                        <Link key={place.id} to={`/place/${place.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: idx * 0.04, duration: 0.4 }}
                                whileTap={{ scale: 0.98 }}
                                layout
                                style={{
                                    display: 'flex', gap: '0.8rem', padding: '0.8rem',
                                    background: '#FFFFFF', borderRadius: '12px', marginBottom: '0.6rem',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    alignItems: 'center', transition: 'all 0.3s ease',
                                    position: 'relative' // Added for absolute heart
                                }}>
                                {/* Image */}
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0,
                                    background: '#EDE5DF', overflow: 'hidden'
                                }}>
                                    {place.hero_image ? (
                                        <img src={place.hero_image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                            <Navigation size={20} color="#9B3A4A" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 className="serif" style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</h3>
                                    <p style={{ fontSize: '0.55rem', color: '#8A8478', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <MapPin size={10} /> {place.city}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{
                                            fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: '#9B3A4A', fontWeight: 600
                                        }}>
                                            {(CATEGORY_LABELS && CATEGORY_LABELS[place.category]) || place.category}
                                        </span>
                                        {place.price_range && (
                                            <span style={{ fontSize: '0.5rem', color: '#C4956A', fontWeight: 600 }}>{place.price_range}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Distance */}
                                {place.distance != null && (
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A' }}>{place.distance.toFixed(1)}</div>
                                        <div style={{ fontSize: '0.4rem', color: '#B5AEA5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>km</div>
                                    </div>
                                )}

                                {/* Heart Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.preventDefault(); toggleFavorite(place.id); }}
                                    style={{
                                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.9)', border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                                    }}>
                                    <Heart size={12} fill={isFavorite(place.id) ? "#9B3A4A" : "transparent"} color={isFavorite(place.id) ? "#9B3A4A" : "#9B3A4A"} />
                                </motion.button>
                            </motion.div>
                        </Link>
                    ))}
                </AnimatePresence>

                {enrichedPlaces.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Navigation size={32} style={{ color: '#B5AEA5', marginBottom: '0.8rem' }} />
                        <p className="serif" style={{ fontSize: '1rem', color: '#8A8478', margin: '0 0 0.3rem' }}>Nessun risultato</p>
                        <p style={{ fontSize: '0.6rem', color: '#B5AEA5' }}>Prova a cambiare categoria</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
