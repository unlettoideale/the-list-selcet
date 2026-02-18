import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Navigation, X, Heart } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_TAGS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const PAGE_SIZE = 20;

export default function NearbyPlaces() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [category, setCategory] = useState('ALL');
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortBy, setSortBy] = useState('distance');
    const { isFavorite, toggleFavorite } = useFavorites();
    const offsetRef = useRef(0);
    const loaderRef = useRef(null);

    const isSearchMode = !!query;

    const getCategoryIcon = (cat) => null;

    // Fetch places with server-side filtering and pagination
    const fetchPlaces = useCallback(async (reset = true) => {
        if (reset) {
            setLoading(true);
            offsetRef.current = 0;
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let q = supabase
                .from('places')
                .select('id, name, category, city, latitude, longitude, hero_image, price_range, tags')
                .eq('status', 'ACTIVE');

            // Server-side search
            if (query) {
                q = q.or(`name.ilike.%${query}%,city.ilike.%${query}%`);
            }

            // Server-side category filter
            if (category !== 'ALL') {
                q = q.eq('category', category);
            }

            // Server-side tag filter  
            if (selectedTag) {
                q = q.contains('tags', [selectedTag]);
            }

            q = q.order('name')
                .range(offsetRef.current, offsetRef.current + PAGE_SIZE - 1);

            const { data, error } = await q;
            if (error) throw error;

            const results = data || [];
            if (reset) {
                setPlaces(results);
            } else {
                setPlaces(prev => [...prev, ...results]);
            }

            offsetRef.current += results.length;
            setHasMore(results.length === PAGE_SIZE);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [query, category, selectedTag]);

    // Get user location once
    useEffect(() => {
        window.scrollTo(0, 0);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => { }
            );
        }
    }, []);

    // Re-fetch when filters change
    useEffect(() => {
        fetchPlaces(true);
    }, [fetchPlaces]);

    useEffect(() => {
        setSelectedTag(null);
    }, [category]);

    // Auto-set category from search query
    useEffect(() => {
        if (!query || !CATEGORY_LABELS) return;
        const lowerQ = query.trim().toLowerCase();
        const matchedEntry = Object.entries(CATEGORY_LABELS).find(([key, label]) =>
            label.toLowerCase() === lowerQ ||
            (key === 'RESTAURANT' && (lowerQ === 'ristorante' || lowerQ === 'ristoranti')) ||
            (key === 'HOTEL' && lowerQ === 'hotel') ||
            (key === 'ROOFTOP' && (lowerQ === 'rooftop' || lowerQ === 'roof top'))
        );
        if (matchedEntry) setCategory(matchedEntry[0]);
    }, [query]);

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        if (!loaderRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchPlaces(false);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, fetchPlaces]);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Enrich with distance (client-side, on the small paginated set)
    const enrichedPlaces = places
        .map(p => ({
            ...p,
            distance: (userLocation && p.latitude && p.longitude)
                ? getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
                : null
        }))
        .sort((a, b) => {
            if (sortBy === 'distance' && a.distance != null && b.distance != null) return a.distance - b.distance;
            return (a.name || '').localeCompare(b.name || '');
        });

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: 'var(--accent)', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                style={{ padding: '2rem 1.2rem 1rem', position: 'sticky', top: 0, zIndex: 100, background: 'var(--header-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate('/')}
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--btn-border)',
                            background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', backdropFilter: 'blur(8px)'
                        }}>
                        <ArrowLeft size={16} color="var(--text-primary)" />
                    </motion.button>
                    <div style={{ flex: 1 }}>
                        <h1 className="serif" style={{ fontSize: '1.4rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
                            {isSearchMode ? `Risultati per "${query}"` : 'Vicino a Te'}
                        </h1>
                        <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', margin: 0 }}>
                            {enrichedPlaces.length} luoghi trovati {isSearchMode ? 'ovunque' : 'nel raggio di 10km'}
                        </p>
                    </div>
                    {isSearchMode && (
                        <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate('/nearby')}
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'var(--btn-bg)',
                                border: '1px solid var(--btn-border)', display: 'flex', alignItems: 'center', gap: '0.3rem',
                                cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-primary)', fontWeight: 500
                            }}>
                            <X size={12} /> Rimuovi filtri
                        </motion.button>
                    )}
                </div>

                {/* Category Filters */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {CATEGORIES && CATEGORIES.map(cat => (
                        <motion.button key={cat} onClick={() => setCategory(cat)} whileTap={{ scale: 0.96 }}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                border: category === cat ? '1px solid var(--accent)' : '1px solid var(--btn-border)',
                                background: category === cat ? 'var(--accent)' : 'var(--btn-bg)',
                                color: category === cat ? '#FFFFFF' : 'var(--text-secondary)',
                                fontSize: '0.65rem', fontWeight: 500,
                                letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.3s ease',
                                boxShadow: category === cat ? '0 4px 12px rgba(212,168,106,0.3)' : 'none'
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
                                        border: selectedTag === tag ? '1px solid var(--accent)' : '1px solid var(--btn-border)',
                                        background: selectedTag === tag ? 'var(--accent)' : 'transparent',
                                        color: selectedTag === tag ? '#FFFFFF' : 'var(--text-muted)',
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
                                    background: 'var(--card-bg)', borderRadius: '14px', marginBottom: '0.6rem',
                                    border: '1px solid var(--card-border)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    alignItems: 'center', transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}>
                                {/* Image */}
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '8px', flexShrink: 0,
                                    background: 'var(--bg-secondary)', overflow: 'hidden'
                                }}>
                                    {place.hero_image ? (
                                        <img src={place.hero_image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                            <Navigation size={20} color="var(--accent)" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 className="serif" style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0 0 0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--card-text)' }}>{place.name}</h3>
                                    <p style={{ fontSize: '0.55rem', color: 'var(--card-text-secondary)', margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <MapPin size={10} /> {place.city}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{
                                            fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: 'var(--accent)', fontWeight: 600
                                        }}>
                                            {(CATEGORY_LABELS && CATEGORY_LABELS[place.category]) || place.category}
                                        </span>
                                        {place.price_range && (
                                            <span style={{ fontSize: '0.5rem', color: 'var(--bronze)', fontWeight: 600 }}>{place.price_range}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Distance */}
                                {place.distance != null && (
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--card-text)' }}>{place.distance.toFixed(1)}</div>
                                        <div style={{ fontSize: '0.4rem', color: 'var(--card-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>km</div>
                                    </div>
                                )}

                                {/* Heart Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.preventDefault(); toggleFavorite(place.id); }}
                                    style={{
                                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: 'var(--heart-bg)', border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                                    }}>
                                    <Heart size={12} fill={isFavorite(place.id) ? "var(--accent)" : "transparent"} color={isFavorite(place.id) ? "var(--accent)" : "var(--card-text-muted)"} />
                                </motion.button>
                            </motion.div>
                        </Link>
                    ))}
                </AnimatePresence>

                {enrichedPlaces.length === 0 && !loadingMore && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Navigation size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
                        <p className="serif" style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 0.3rem' }}>Nessun risultato</p>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Prova a cambiare categoria</p>
                    </motion.div>
                )}

                {/* Infinite Scroll Loader */}
                <div ref={loaderRef} style={{ padding: '1.5rem', textAlign: 'center' }}>
                    {loadingMore && (
                        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ color: 'var(--accent)', letterSpacing: '0.2em', fontSize: '0.6rem', fontFamily: 'var(--font-serif)' }}>
                            Caricamento...
                        </motion.div>
                    )}
                    {!hasMore && enrichedPlaces.length > 0 && (
                        <p style={{ fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                            Tutti i {enrichedPlaces.length} luoghi caricati
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
