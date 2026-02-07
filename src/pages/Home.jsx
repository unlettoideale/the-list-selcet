import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Navigation, ChevronRight, Star } from 'lucide-react';

// Google Maps Component with Expand Animation
const GoogleMap = ({ center, places, userLocation, allPlaces }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const infoWindowRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        // Clear old markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // Initialize or update map
        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: { lat: center[0], lng: center[1] },
                zoom: 12,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#1A0406" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#1A0406" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#A68966" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
                    { featureType: "poi", stylers: [{ visibility: "off" }] }
                ],
                disableDefaultUI: true,
                zoomControl: isExpanded,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: isExpanded ? 'greedy' : 'cooperative'
            });

            infoWindowRef.current = new window.google.maps.InfoWindow();

            mapInstance.current.addListener('click', () => {
                if (!isExpanded) setIsExpanded(true);
            });
        } else {
            mapInstance.current.setCenter({ lat: center[0], lng: center[1] });
            mapInstance.current.setOptions({
                zoomControl: isExpanded,
                gestureHandling: isExpanded ? 'greedy' : 'cooperative'
            });
        }

        // User location marker
        if (userLocation) {
            new window.google.maps.Marker({
                position: { lat: userLocation.lat, lng: userLocation.lng },
                map: mapInstance.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 3
                },
                title: "Tu sei qui",
                zIndex: 1000,
                animation: window.google.maps.Animation.DROP
            });
        }

        const placesToShow = allPlaces || places || [];

        placesToShow.forEach((place, index) => {
            const lat = parseFloat(place.latitude);
            const lng = parseFloat(place.longitude);
            if (isNaN(lat) || isNaN(lng)) return;

            const marker = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapInstance.current,
                icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(36, 36)
                },
                title: place.name,
                zIndex: 100 + index,
                animation: window.google.maps.Animation.DROP
            });

            const contentString = `
                <div style="color:#1A0406;font-family:sans-serif;max-width:220px;">
                    ${place.hero_image ? `
                        <div style="width:100%;height:100px;background:#f0f0f0;border-radius:8px 8px 0 0;overflow:hidden;">
                            <img src="${place.hero_image}" style="width:100%;height:100%;object-fit:cover;" alt="${place.name}"/>
                        </div>
                    ` : ''}
                    <div style="padding:12px;">
                        <strong style="font-size:14px;display:block;margin-bottom:4px;color:#1A0406;">${place.name}</strong>
                        <div style="font-size:11px;color:#666;margin-bottom:4px;">${place.city || ''}</div>
                        ${place.price_range ? `<span style="font-size:11px;color:#5D1219;font-weight:600;">${place.price_range}</span>` : ''}
                        <a href="/place/${place.id}" style="display:block;margin-top:8px;padding:6px 12px;background:#5D1219;color:#fff;text-decoration:none;border-radius:4px;font-size:11px;text-align:center;">
                            Scopri →
                        </a>
                    </div>
                </div>
            `;

            marker.addListener('click', () => {
                infoWindowRef.current.close();
                infoWindowRef.current.setContent(contentString);
                infoWindowRef.current.open(mapInstance.current, marker);
            });

            markersRef.current.push(marker);
        });

    }, [center, places, userLocation, allPlaces, isExpanded]);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <div
            style={{
                width: '100%',
                height: isExpanded ? '400px' : '180px',
                position: 'relative',
                transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: isExpanded ? 'default' : 'pointer'
            }}
            onClick={() => !isExpanded && setIsExpanded(true)}
        >
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            {!isExpanded && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    pointerEvents: 'none'
                }}>
                    TAP PER ESPANDERE
                </div>
            )}

            {isExpanded && (
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    ×
                </button>
            )}

            <style>{`
                .gm-style-cc, .gmnoprint:not(.gm-bundled-control), 
                .gm-style a[href^="https://maps.google.com"],
                .gm-style div[style*="background-color: white"] { 
                    display: none !important; 
                }
                .gm-style .gm-style-iw-c {
                    border-radius: 12px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                    padding: 0 !important;
                }
                .gm-style .gm-style-iw-d {
                    overflow: hidden !important;
                }
            `}</style>
        </div>
    );
};

const Home = ({ externalQuery }) => {
    const [places, setPlaces] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [category, setCategory] = useState('ALL');
    const [priceRange, setPriceRange] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('prompt');
    const [mapCenter, setMapCenter] = useState([45.4642, 9.1900]);

    const categories = ['ALL', 'RESTAURANT', 'HOTEL', 'BAR', 'EXPERIENCE'];

    useEffect(() => {
        fetchPlaces();
        requestLocation();
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (places.length > 0) calculateNearby();
    }, [places, userLocation]);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(loc);
                    setMapCenter([loc.lat, loc.lng]);
                    setLocationStatus('granted');
                },
                () => setLocationStatus('denied')
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
        } finally {
            setLoading(false);
        }
    }

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const calculateNearby = () => {
        if (userLocation) {
            const nearby = places
                .filter(p => p.latitude && p.longitude)
                .map(p => ({ ...p, distance: getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude) }))
                .filter(p => p.distance < 100)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 6);
            setNearbyPlaces(nearby);
        } else {
            setNearbyPlaces(places.slice(0, 6));
        }
    };

    const filteredPlaces = places.filter(p => {
        const matchesCat = category === 'ALL' || p.category === category;
        const matchesPrice = priceRange === 'ALL' || p.price_range === priceRange;
        const matchesQuery = !externalQuery ||
            p.name?.toLowerCase().includes(externalQuery.toLowerCase()) ||
            p.city?.toLowerCase().includes(externalQuery.toLowerCase());
        return matchesCat && matchesPrice && matchesQuery;
    });

    const getCategoryEmoji = (cat) => {
        switch (cat) {
            case 'RESTAURANT': return '🍽️';
            case 'HOTEL': return '🏨';
            case 'BAR': return '🍸';
            case 'EXPERIENCE': return '⭐';
            default: return '';
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #0A0304 0%, #1A0406 50%, #0A0304 100%)',
            color: '#FDFDFB',
            paddingBottom: '120px'
        }}>

            {/* HERO */}
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '3rem 1.5rem 2rem', textAlign: 'center' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}
                >
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%', background: '#FDFDFB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 30px rgba(166, 137, 102, 0.3)'
                    }}>
                        <span style={{
                            color: '#5D1219', fontFamily: 'var(--font-serif)', fontSize: '0.5rem',
                            fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                            lineHeight: 1, textAlign: 'center'
                        }}>
                            The<br />List
                        </span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="serif"
                    style={{
                        fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', margin: 0,
                        background: 'linear-gradient(135deg, #FDFDFB 0%, #A68966 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}
                >
                    Selected.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.6 }}
                    style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '0.5rem' }}
                >
                    A personal curation of places worth being
                </motion.p>
            </motion.header>

            {/* VICINO A TE */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ padding: '0 1rem', marginBottom: '4rem' }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, rgba(93,18,25,0.3) 0%, rgba(26,4,6,0.8) 100%)',
                    borderRadius: '20px', border: '1px solid rgba(166, 137, 102, 0.2)',
                    overflow: 'hidden', backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #A68966 0%, #5D1219 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Navigation size={16} color="white" />
                            </div>
                            <div>
                                <h2 className="serif" style={{ fontSize: '1.3rem', fontWeight: 400, margin: 0 }}>
                                    Vicino a Te
                                </h2>
                                <p style={{ fontSize: '0.6rem', opacity: 0.5, margin: 0 }}>
                                    {locationStatus === 'granted'
                                        ? `${nearbyPlaces.length} luoghi selezionati nella tua zona`
                                        : 'Attiva la posizione per scoprire i luoghi vicini'}
                                </p>
                            </div>
                        </div>
                        {nearbyPlaces.length > 0 && (
                            <span style={{
                                fontSize: '0.55rem', padding: '0.4rem 0.8rem',
                                background: 'rgba(166, 137, 102, 0.2)', borderRadius: '20px',
                                color: '#A68966', fontWeight: 600, letterSpacing: '0.1em'
                            }}>
                                {nearbyPlaces.length} RESULTS
                            </span>
                        )}
                    </div>

                    {nearbyPlaces.length > 0 && (
                        <div style={{ padding: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <div style={{ display: 'flex', gap: '1rem', paddingRight: '1rem' }}>
                                {nearbyPlaces.map((place, idx) => (
                                    <Link key={place.id} to={`/place/${place.id}`}
                                        style={{ minWidth: '200px', maxWidth: '200px', textDecoration: 'none', color: 'inherit' }}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            style={{
                                                background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
                                                overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <div style={{ height: '120px', background: '#1A0406', position: 'relative' }}>
                                                {place.hero_image ? (
                                                    <img src={place.hero_image} alt={place.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{
                                                        width: '100%', height: '100%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '2rem', opacity: 0.3
                                                    }}>
                                                        {getCategoryEmoji(place.category)}
                                                    </div>
                                                )}
                                                {place.distance && (
                                                    <div style={{
                                                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                        background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px', fontSize: '0.55rem', fontWeight: 600
                                                    }}>
                                                        📍 {place.distance.toFixed(1)} km
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '0.8rem' }}>
                                                <h4 className="serif" style={{
                                                    fontSize: '0.9rem', margin: '0 0 0.3rem 0',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {place.name}
                                                </h4>
                                                <p style={{
                                                    fontSize: '0.6rem', opacity: 0.5, margin: 0,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}>
                                                    <MapPin size={10} /> {place.city}
                                                    {place.price_range && (
                                                        <span style={{ marginLeft: 'auto', color: '#A68966' }}>
                                                            {place.price_range}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mini Map */}
                    <div style={{ height: '180px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <GoogleMap center={mapCenter} places={nearbyPlaces} allPlaces={places} userLocation={userLocation} />
                    </div>
                </div>
            </motion.section>

            {/* FILTERS */}
            <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '20px',
                                border: category === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                background: category === cat
                                    ? 'linear-gradient(135deg, #5D1219 0%, #A68966 100%)'
                                    : 'transparent',
                                color: '#FDFDFB', fontSize: '0.65rem', fontWeight: 600,
                                letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap'
                            }}
                        >
                            {cat === 'ALL' ? 'TUTTI' : `${getCategoryEmoji(cat)} ${cat}`}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    {['ALL', '€', '€€', '€€€', '€€€€', '€€€€€'].map(price => (
                        <button key={price} onClick={() => setPriceRange(price)}
                            style={{
                                padding: '0.4rem 0.8rem', borderRadius: '4px',
                                border: priceRange === price ? '1px solid #A68966' : '1px solid rgba(255,255,255,0.05)',
                                background: priceRange === price ? 'rgba(166, 137, 102, 0.2)' : 'transparent',
                                color: priceRange === price ? '#A68966' : 'rgba(255,255,255,0.4)',
                                fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            {price === 'ALL' ? 'Tutti' : price}
                        </button>
                    ))}
                </div>
            </div>

            {/* ALL PLACES */}
            <section style={{ padding: '0 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="serif" style={{ fontSize: '1.3rem', fontWeight: 400, margin: 0, opacity: 0.9 }}>
                        La Selezione
                    </h2>
                    <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>{filteredPlaces.length} luoghi</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.4 }}>
                        <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em' }}>CURATING...</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredPlaces.map((place, idx) => (
                            <Link key={place.id} to={`/place/${place.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <motion.article
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <div style={{ height: '220px', background: '#1A0406', position: 'relative' }}>
                                        {place.hero_image ? (
                                            <img src={place.hero_image} alt={place.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '4rem', opacity: 0.2
                                            }}>
                                                {getCategoryEmoji(place.category)}
                                            </div>
                                        )}

                                        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <span style={{
                                                background: 'rgba(0,0,0,0.7)', padding: '0.3rem 0.6rem',
                                                borderRadius: '4px', fontSize: '0.5rem', fontWeight: 700,
                                                letterSpacing: '0.1em', backdropFilter: 'blur(10px)'
                                            }}>
                                                {getCategoryEmoji(place.category)} {place.category}
                                            </span>
                                            {place.price_range && (
                                                <span style={{
                                                    background: '#5D1219', padding: '0.3rem 0.6rem',
                                                    borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700
                                                }}>
                                                    {place.price_range}
                                                </span>
                                            )}
                                        </div>

                                        {place.gallery?.length > 1 && (
                                            <div style={{
                                                position: 'absolute', bottom: '1rem', right: '1rem',
                                                background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.6rem',
                                                borderRadius: '4px', fontSize: '0.55rem'
                                            }}>
                                                📷 {place.gallery.length}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.45rem', letterSpacing: '0.2em',
                                                color: '#A68966', fontWeight: 700
                                            }}>
                                                CURATED
                                            </span>
                                            <Star size={10} color="#A68966" fill="#A68966" />
                                        </div>

                                        <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 400, margin: '0 0 0.5rem 0' }}>
                                            {place.name}
                                        </h3>

                                        <p style={{
                                            fontSize: '0.7rem', opacity: 0.5, margin: '0 0 0.8rem 0',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem'
                                        }}>
                                            <MapPin size={12} /> {place.city}
                                            {place.address && ` — ${place.address}`}
                                        </p>

                                        {place.tags?.length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                {place.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} style={{
                                                        background: 'rgba(166, 137, 102, 0.1)',
                                                        padding: '0.25rem 0.6rem', borderRadius: '4px',
                                                        fontSize: '0.55rem', color: '#A68966'
                                                    }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{
                                            marginTop: '1rem', paddingTop: '1rem',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}>
                                            <span style={{ fontSize: '0.6rem', opacity: 0.4, letterSpacing: '0.1em' }}>
                                                SCOPRI
                                            </span>
                                            <ChevronRight size={16} style={{ opacity: 0.4 }} />
                                        </div>
                                    </div>
                                </motion.article>
                            </Link>
                        ))}

                        {filteredPlaces.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
                                <p className="serif" style={{ fontSize: '1rem' }}>Nessun luogo trovato</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
