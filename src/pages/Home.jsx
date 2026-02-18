import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getMapStyle, createMarkerElement } from '../lib/mapSetup';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, ChevronRight, Star, Clock, Heart } from 'lucide-react';
import { CATEGORIES, CATEGORY_LABELS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const MiniMap = ({ center, places, userLocation }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        if (!mapInstance.current) {
            mapInstance.current = new maplibregl.Map({
                container: mapRef.current,
                style: getMapStyle(),
                center: [center[1], center[0]], // MapLibre uses [lng, lat]
                zoom: 14,
                attributionControl: false,
                interactive: false // Non-interactive preview
            });

            // Navigate to full map on click
            mapRef.current.addEventListener('click', () => navigate('/map'));
        } else {
            mapInstance.current.setCenter([center[1], center[0]]);
        }

        // Wait for map to load before adding markers
        const addMarkers = () => {
            // User location dot
            if (userLocation) {
                const el = document.createElement('div');
                el.style.cssText = 'width:16px;height:16px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(66,133,244,0.4);';
                const m = new maplibregl.Marker({ element: el })
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .addTo(mapInstance.current);
                markersRef.current.push(m);
            }

            // Place markers
            (places || []).forEach(place => {
                const lat = parseFloat(place.latitude), lng = parseFloat(place.longitude);
                if (isNaN(lat) || isNaN(lng)) return;
                const el = createMarkerElement(place.category, 28);
                el.style.pointerEvents = 'none';
                const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([lng, lat])
                    .addTo(mapInstance.current);
                markersRef.current.push(m);
            });

            // Center on user
            if (userLocation) {
                mapInstance.current.setCenter([userLocation.lng, userLocation.lat]);
                mapInstance.current.setZoom(places && places.length > 0 ? 13 : 14);
            } else if (places && places.length > 0) {
                const p = places[0];
                const lat = parseFloat(p.latitude), lng = parseFloat(p.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    mapInstance.current.setCenter([lng, lat]);
                    mapInstance.current.setZoom(13);
                }
            }
        };

        if (mapInstance.current.loaded()) {
            addMarkers();
        } else {
            mapInstance.current.on('load', addMarkers);
        }

        return () => { };
    }, [center, places, userLocation, navigate]);

    return (
        <div style={{
            width: '100%', height: '240px', position: 'relative', cursor: 'pointer',
            borderRadius: '16px', overflow: 'hidden'
        }} onClick={() => navigate('/map')}>
            <div ref={mapRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{
                    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)', color: '#fff',
                    padding: '7px 18px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 600,
                    letterSpacing: '0.15em', pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>APRI MAPPA</motion.div>
        </div>
    );
};


const Home = ({ session }) => {
    const [places, setPlaces] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [category, setCategory] = useState('ALL');
    const [priceRange, setPriceRange] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('prompt');
    const [mapCenter, setMapCenter] = useState([45.4642, 9.1900]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const categories = ['ALL', 'RESTAURANT', 'ROOFTOP', 'HOTEL', 'BREAKFAST_BAR', 'COCKTAIL_BAR'];
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        const cached = sessionStorage.getItem('home_places');
        if (cached) {
            try { setPlaces(JSON.parse(cached)); setLoading(false); } catch { fetchPlaces(); }
        } else { fetchPlaces(); }
        requestLocation(); window.scrollTo(0, 0);
        try { const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); setRecentlyViewed(stored.slice(0, 4)); } catch (e) { }
    }, []);
    useEffect(() => { if (places.length > 0) calculateNearby(); }, [places, userLocation]);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => { const loc = { lat: p.coords.latitude, lng: p.coords.longitude }; setUserLocation(loc); setMapCenter([loc.lat, loc.lng]); setLocationStatus('granted'); },
                () => setLocationStatus('denied')
            );
        }
    };

    async function fetchPlaces() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('id, name, category, city, latitude, longitude, hero_image, price_range, tags, created_at')
                .eq('status', 'ACTIVE')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            const places = data || [];
            setPlaces(places);
            try { sessionStorage.setItem('home_places', JSON.stringify(places)); } catch { }
        }
        catch (err) { console.error("Fetch error:", err); } finally { setLoading(false); }
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const calculateNearby = () => {
        if (userLocation) {
            const nearby = places.filter(p => p.latitude && p.longitude)
                .map(p => ({ ...p, distance: getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude) }))
                .filter(p => p.distance <= 50) // 50km radius
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 4);
            setNearbyPlaces(nearby);
            // Update map center to user
            setMapCenter([userLocation.lat, userLocation.lng]);
        } else {
            // No location — don't show random distant places
            setNearbyPlaces([]);
        }
    };




    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary-gradient)', color: 'var(--text-primary)', paddingBottom: '100px' }}>

            {/* Header */}
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                style={{ padding: '2.2rem 1.5rem 1.2rem', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    {/* Premium stacked logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
                        <motion.span
                            initial={{ opacity: 0, letterSpacing: '0.8em' }}
                            animate={{ opacity: 1, letterSpacing: '0.35em' }}
                            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{ fontFamily: 'var(--font-sans)', fontSize: '0.55rem', fontWeight: 300, textTransform: 'uppercase', color: 'var(--accent)', lineHeight: 1 }}>
                            THE
                        </motion.span>
                        {/* Gold line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--bronze), transparent)', margin: '3px 0', transformOrigin: 'center' }} />
                        <motion.span
                            initial={{ opacity: 0, letterSpacing: '0.6em' }}
                            animate={{ opacity: 1, letterSpacing: '0.22em' }}
                            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>
                            LIST
                        </motion.span>
                    </div>
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.25, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, transparent, var(--bronze-soft), transparent)', flexShrink: 0, transformOrigin: 'center' }} />
                    <motion.h1
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="serif" style={{ fontSize: '1.8rem', fontWeight: 300, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', fontStyle: 'italic' }}>Selected.</motion.h1>
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.3 }}
                    style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    A personal curation of places worth being
                </motion.p>
            </motion.header>

            {/* Visualizzato Recentemente */}
            {recentlyViewed.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                    style={{ padding: '0 1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', padding: '0 0.2rem' }}>
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, flex: 1 }}>Visualizzato Recentemente</span>
                        <button onClick={() => { localStorage.removeItem('recentlyViewed'); setRecentlyViewed([]); }} style={{
                            background: 'none', border: 'none', padding: '0.2rem 0.4rem', cursor: 'pointer',
                            fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 500, opacity: 0.7,
                            transition: 'opacity 0.2s', fontFamily: 'inherit'
                        }}>Cancella</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        {recentlyViewed.map((place, idx) => (
                            <Link key={place.id} to={`/place/${place.id}`} style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.08, duration: 0.5 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        background: 'var(--card-bg)', borderRadius: '14px', padding: '0.6rem',
                                        border: '1px solid var(--card-border)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.5) inset',
                                        transition: 'all 0.3s ease', overflow: 'hidden',
                                        minWidth: 0
                                    }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                                        background: 'var(--bg-secondary)', overflow: 'hidden'
                                    }}>
                                        {place.hero_image ? (
                                            <img src={place.hero_image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', opacity: 0.3 }}>
                                                <Navigation size={16} color="var(--accent)" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                        <p className="serif" style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--card-text)' }}>{place.name}</p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--card-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.city}</p>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            )
            }

            {/* Separator */}
            {recentlyViewed.length > 0 && <div style={{ margin: '0 2rem 1.5rem', height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />}

            {/* Vicino a Te */}
            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                style={{ padding: '0 1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', padding: '0 0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Navigation size={16} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Vicino a Te</span>
                    </div>
                    {locationStatus === 'granted' && nearbyPlaces.length > 0 && (
                        <Link to="/nearby" style={{ textDecoration: 'none' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'var(--accent-soft)', borderRadius: '20px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                                Visualizza tutti →
                            </span>
                        </Link>
                    )}
                </div>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                    <MiniMap center={mapCenter} places={nearbyPlaces} userLocation={userLocation} />
                </div>
                {/* APRI MAPPA override within GoogleMap component likely needs prop or check component definition */}
            </motion.section>

            {/* Novità Section */}
            {
                places.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
                        style={{ padding: '0 0 0 1rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', paddingRight: '1rem' }}>
                            <Star size={16} style={{ color: 'var(--bronze)' }} />
                            <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Novità</span>
                        </div>
                        <div className="no-scrollbar" style={{
                            display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', paddingRight: '1rem',
                            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
                        }}>
                            {[...places].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6).map((place, idx) => (
                                <Link key={place.id} to={`/place/${place.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
                                    <motion.div
                                        whileTap={{ scale: 0.96 }}
                                        style={{
                                            width: '180px', height: '260px', background: 'var(--card-bg)', borderRadius: '16px',
                                            overflow: 'hidden', border: '1px solid var(--card-border)',
                                            boxShadow: '0 6px 30px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.5) inset', scrollSnapAlign: 'start',
                                            display: 'flex', flexDirection: 'column'
                                        }}>
                                        <div style={{ height: '160px', position: 'relative', background: 'var(--bg-secondary)' }}>
                                            {place.hero_image ? (
                                                <img src={place.hero_image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.2 }}>
                                                    <Navigation size={32} color="var(--accent)" />
                                                </div>
                                            )}
                                            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'linear-gradient(135deg, var(--accent), var(--bronze))', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', color: '#FFFFFF' }}>
                                                NEW
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.preventDefault(); toggleFavorite(place.id); }}
                                                style={{
                                                    position: 'absolute', top: '8px', right: '8px',
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: 'var(--heart-bg)', border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)'
                                                }}>
                                                <Heart size={14} fill={isFavorite(place.id) ? "var(--accent)" : "transparent"} color={isFavorite(place.id) ? "var(--accent)" : "var(--accent)"} />
                                            </motion.button>
                                        </div>
                                        <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 className="serif" style={{ fontSize: '1.05rem', fontWeight: 500, margin: '0 0 0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--card-text)' }}>{place.name}</h3>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--card-text-secondary)', margin: 0 }}>{place.city}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 600 }}>{CATEGORY_LABELS[place.category] || place.category}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--bronze)', fontWeight: 600 }}>{place.price_range}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.section>
                )
            }


        </div >
    );
};

export default Home;
