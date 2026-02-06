import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, ArrowRight } from 'lucide-react';

// Fix for default Leaflet icon markers in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Marker Component using L.divIcon
const customIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="custom-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const MapExplorer = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        fetchPlaces();
    }, []);

    async function fetchPlaces() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .eq('status', 'ACTIVE');

            if (error) {
                console.error('Error fetching places:', error);
            } else if (data) {
                const dataWithCoords = data.map(p => ({
                    ...p,
                    lat: parseFloat(p.latitude) || (45.4642 + (Math.random() - 0.5) * 0.05),
                    lng: parseFloat(p.longitude) || (9.1900 + (Math.random() - 0.5) * 0.05)
                }));
                setPlaces(dataWithCoords);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div style={{ backgroundColor: 'var(--deep-bordeaux)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--ivory)' }}>
            <p className="serif" style={{ letterSpacing: '0.3em', opacity: 0.5 }}>CALIBRATING COORDINATES...</p>
        </div>
    );

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--deep-bordeaux)' }}>
            {/* Overlay Navigation */}
            <div style={{
                position: 'absolute',
                top: '2rem',
                left: '2rem',
                right: '2rem',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                pointerEvents: 'none'
            }}>
                <Link to="/" style={{
                    pointerEvents: 'auto',
                    backgroundColor: 'rgba(45, 8, 11, 0.8)',
                    border: '1px solid var(--border-ivory)',
                    padding: '12px 24px',
                    color: 'var(--ivory)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(10px)'
                }}>
                    ← Archive View
                </Link>

                <div style={{
                    backgroundColor: 'rgba(45, 8, 11, 0.8)',
                    border: '1px solid var(--border-ivory)',
                    padding: '12px 24px',
                    color: 'var(--ivory)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(10px)'
                }}>
                    Selection / {places.length} Entries
                </div>
            </div>

            {/* Map Background */}
            <div style={{ height: '100vh', width: '100vw' }}>
                <MapContainer
                    center={[45.4642, 9.1900]}
                    zoom={13}
                    style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {places.map(place => (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lng]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => setSelectedPlace(place)
                            }}
                        >
                            <Popup>
                                <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                    <h3 className="serif" style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{place.name}</h3>
                                    <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, margin: 0 }}>
                                        {place.city}
                                    </p>
                                    <Link to={`/place/${place.id}`} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        marginTop: '10px',
                                        fontSize: '0.65rem',
                                        textTransform: 'uppercase',
                                        color: '#4A0E13',
                                        fontWeight: 700
                                    }}>
                                        Explore <ArrowRight size={10} />
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Cinematic Sidebar for Selected Place */}
            <AnimatePresence>
                {selectedPlace && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 'clamp(320px, 35vw, 450px)',
                            height: '100vh',
                            backgroundColor: 'rgba(45, 8, 11, 0.95)',
                            backdropFilter: 'blur(25px)',
                            borderLeft: '1px solid var(--border-ivory)',
                            zIndex: 1001,
                            padding: '5rem 3rem',
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'var(--ivory)'
                        }}
                    >
                        <button
                            onClick={() => setSelectedPlace(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--ivory)', position: 'absolute', top: '2.5rem', right: '2.5rem', cursor: 'pointer', opacity: 0.5 }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ aspectRatio: '1/1', overflow: 'hidden', border: '1px solid var(--border-ivory)', marginBottom: '3rem' }}>
                            <img src={selectedPlace.hero_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <span style={{ fontSize: '0.65rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.4 }}>
                            {selectedPlace.category} // {selectedPlace.city}
                        </span>
                        <h2 className="serif" style={{ fontSize: '2.5rem', margin: '1.2rem 0', lineHeight: 1 }}>{selectedPlace.name}</h2>

                        <p style={{ fontSize: '0.95rem', lineHeight: 1.8, opacity: 0.7, margin: '2rem 0', fontWeight: 300 }}>
                            {selectedPlace.description || "Un'esperienza riservata e curata nei minimi dettagli."}
                        </p>

                        <Link to={`/place/${selectedPlace.id}`} className="luxury-button" style={{ marginTop: 'auto', textAlign: 'center' }}>
                            View Entry Details
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MapExplorer;
