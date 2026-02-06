import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons
if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

const Home = ({ externalQuery }) => {
    const [view, setView] = useState('list');
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [category, setCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

    const categories = ['ALL', 'RESTAURANT', 'HOTEL', 'BAR', 'EXPERIENCE'];

    useEffect(() => {
        fetchPlaces();
        requestLocation();
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        filterPlaces();
    }, [externalQuery, category, places, userLocation]);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('granted');
                },
                (error) => {
                    console.log("Location access denied or unavailable", error);
                    setLocationStatus('denied');
                }
            );
        }
    };

    async function fetchPlaces() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('status', 'ACTIVE');

            if (error) throw error;
            setPlaces(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
            setPlaces([]);
        } finally {
            setLoading(false);
        }
    }

    // Rough distance calculation for editorial relevance
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    function filterPlaces() {
        // Main list filter
        let result = [...places];
        if (category !== 'ALL') {
            result = result.filter(p => p.category?.toUpperCase() === category);
        }
        if (externalQuery) {
            const q = externalQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.city?.toLowerCase().includes(q)
            );
        }
        setFilteredPlaces(result);

        // Nearby section logic (Editorial)
        if (places.length > 0) {
            let nearby = [];
            if (userLocation) {
                // Calculate distances but don't strictly sort only by it
                // We pick items within ~50km and shuffle/limit to 5-8
                nearby = places
                    .filter(p => p.latitude && p.longitude)
                    .map(p => ({
                        ...p,
                        dist: getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
                    }))
                    .filter(p => p.dist < 50)
                    .sort(() => Math.random() - 0.5) // Randomize for editorial feel
                    .slice(0, 8);
            }

            // Fallback if no location or no nearby results: just show latest curated items
            if (nearby.length === 0) {
                nearby = places.slice(0, 5);
            }
            setNearbyPlaces(nearby);
        }
    }

    return (
        <div className="app-shell" style={{ minHeight: '100vh', paddingBottom: '100px' }}>

            {/* TOP HEADER: Bubble Logo + Selected Text */}
            <div style={{
                position: 'fixed',
                top: '2.5rem',
                left: '1.5rem',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--ivory)',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div style={{
                        color: 'var(--bordeaux-main)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        lineHeight: 1,
                        textAlign: 'center',
                        textTransform: 'uppercase'
                    }}>
                        The<br />List
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="serif"
                    style={{
                        fontSize: '2.2rem',
                        fontWeight: 200,
                        color: 'var(--ivory)',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}
                >
                    Selected.
                </motion.h2>
            </div>

            {/* HERO SECTION - Minimal Spacing */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    paddingTop: '10rem',
                    paddingBottom: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}
            />

            <div className="luxury-container">

                {/* 📍 EDITORIAL NEARBY SECTION */}
                {!externalQuery && category === 'ALL' && nearbyPlaces.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom: '6rem', padding: '0 1rem' }}
                    >
                        <h3 className="serif" style={{
                            fontSize: '1.4rem',
                            marginBottom: '2rem',
                            color: 'var(--ivory)',
                            fontWeight: 300,
                            letterSpacing: '0.02em'
                        }}>
                            {locationStatus === 'granted' ? 'Selected Nearby' : 'Selected in your city.'}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {nearbyPlaces.map((place, idx) => (
                                <Link key={`nearby-${place.id}`} to={`/place/${place.id}`} className="place-card">
                                    <div className="place-image-wrapper" style={{ borderRadius: '2px', aspectSatio: '16/9' }}>
                                        <img src={place.hero_image} alt={place.name} className="place-image" />
                                    </div>
                                    <div className="place-info" style={{ padding: '0.5rem' }}>
                                        <div className="selected-badge" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', marginBottom: '1rem', fontSize: '0.45rem' }}>CURATED</div>
                                        <h4 className="serif" style={{ fontSize: '1.5rem', color: 'var(--ivory)', margin: '0 0 0.5rem 0' }}>{place.name}</h4>
                                        <p className="place-location" style={{ fontSize: '0.65rem' }}>{place.city} — {place.category}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div style={{
                            height: '1px',
                            background: 'var(--border)',
                            margin: '4rem 2rem 0 2rem',
                            opacity: 0.5
                        }} />
                    </motion.section>
                )}

                {/* CATEGORY FILTER */}
                <div className="category-filter">
                    {categories.map(cat => (
                        <span
                            key={cat}
                            className={`category-item ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                {/* VIEW TOGGLE */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <button
                        onClick={() => setView(view === 'list' ? 'map' : 'list')}
                        style={{
                            background: 'transparent',
                            border: '0.5px solid var(--border)',
                            borderRadius: '20px',
                            padding: '0.5rem 1.2rem',
                            color: 'var(--ivory)',
                            fontSize: '0.55rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            opacity: 0.6
                        }}
                    >
                        {view === 'list' ? 'Switch to Map' : 'Switch to List'}
                    </button>
                    {externalQuery && (
                        <p style={{ fontSize: '0.6rem', marginTop: '1.5rem', opacity: 0.4, letterSpacing: '0.1em' }}>
                            Risultati per: <span style={{ color: 'var(--gold)' }}>"{externalQuery}"</span>
                        </p>
                    )}
                </div>

                {/* MAIN CONTENT AREA */}
                <main style={{ padding: '0 1rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0', opacity: 0.5 }}>
                            <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em' }}>CURATING SELECTION...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {view === 'list' ? (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {filteredPlaces.length > 0 ? (
                                        filteredPlaces.map((place, idx) => (
                                            <Link key={place.id} to={`/place/${place.id}`} className="place-card">
                                                <div className="place-image-wrapper" style={{ borderRadius: '4px' }}>
                                                    <img src={place.hero_image} alt={place.name} className="place-image" />
                                                </div>
                                                <div className="place-info" style={{ padding: '0.5rem' }}>
                                                    <div className="selected-badge" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', marginBottom: '1rem' }}>SELECTED</div>
                                                    <h3 className="serif place-name" style={{ color: 'var(--ivory)' }}>{place.name}</h3>
                                                    <p className="place-location">{place.city} — {place.neighborhood || place.category}</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '8rem 0', opacity: 0.4 }}>
                                            <p className="serif">No entries found for this selection.</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="map"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ height: '60vh', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}
                                >
                                    <MapContainer
                                        center={[45.4642, 9.1900]}
                                        zoom={12}
                                        style={{ height: '100%', width: '100%' }}
                                        zoomControl={false}
                                    >
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        {filteredPlaces.map(place => (
                                            <Marker key={place.id} position={[place.latitude || 45.4642, place.longitude || 9.1900]}>
                                                <Popup>
                                                    <div style={{ color: '#000', padding: '5px' }}>
                                                        <h4 className="serif">{place.name}</h4>
                                                        <Link to={`/place/${place.id}`} style={{ fontSize: '0.7rem', color: '#5D1219' }}>DETAILS</Link>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Home;
