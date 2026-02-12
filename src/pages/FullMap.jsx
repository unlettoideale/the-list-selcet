import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Navigation } from 'lucide-react';

export default function FullMap() {
    const navigate = useNavigate();
    const [places, setPlaces] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [category, setCategory] = useState('ALL');
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const infoWindowRef = useRef(null);

    const categories = ['ALL', 'RESTAURANT', 'ROOFTOP', 'HOTEL', 'BREAKFAST_BAR', 'COCKTAIL_BAR'];
    const categoryLabels = {
        'ALL': 'Tutti',
        'RESTAURANT': 'Ristoranti',
        'ROOFTOP': 'Roof Top',
        'HOTEL': 'Hotel',
        'BREAKFAST_BAR': 'Colazione',
        'COCKTAIL_BAR': 'Cocktail Bar'
    };
    const getCategoryIcon = (cat) => null;

    useEffect(() => {
        const fetchPlaces = async () => {
            const { data } = await supabase.from('places').select('*').eq('status', 'ACTIVE');
            setPlaces(data || []);
        };
        fetchPlaces();

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                () => console.log("Location access denied")
            );
        }
    }, []);

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Filter places based on category AND distance (10km)
    useEffect(() => {
        let filtered = places.filter(p => p.latitude && p.longitude);

        if (userLocation) {
            filtered = filtered.filter(p => {
                const dist = getDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
                return dist <= 10;
            });
        }

        if (category !== 'ALL') {
            filtered = filtered.filter(p => p.category === category);
        }
        setNearbyPlaces(filtered);
    }, [places, userLocation, category]);


    // Map Initialization and Update
    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: userLocation || { lat: 45.4642, lng: 9.1900 },
                zoom: 14,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#F2EDE8" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#F7F2EE" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#8A8478" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#E8DFD6" }] },
                    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E0D5CA" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#CBDBE5" }] },
                    { featureType: "poi", stylers: [{ visibility: "off" }] },
                ],
                disableDefaultUI: true,
                zoomControl: false,
                gestureHandling: 'greedy'
            });
            infoWindowRef.current = new window.google.maps.InfoWindow();
        }

        // Update User Marker
        if (userLocation) {
            new window.google.maps.Marker({
                position: userLocation,
                map: mapInstance.current,
                icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 3 },
                title: "Tu sei qui", zIndex: 1000
            });
            if (!places.length) mapInstance.current.setCenter(userLocation);
        }

        // Clear existing markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // Add Place Markers
        nearbyPlaces.forEach((place, i) => {
            const marker = new window.google.maps.Marker({
                position: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
                map: mapInstance.current,
                icon: {
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: '#9B3A4A', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 1.5,
                    scale: 1.4, anchor: new window.google.maps.Point(12, 24)
                },
                zIndex: 100 + i
            });

            marker.addListener('click', () => {
                infoWindowRef.current.close();
                const imgHtml = place.hero_image
                    ? `<img src="${place.hero_image}" style="width:100%;height:100px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />`
                    : '';
                infoWindowRef.current.setContent(`
                    <div style="font-family:'Inter',sans-serif;width:200px;border-radius:8px;">
                        ${imgHtml}
                        <div style="padding:10px 12px;">
                            <div style="font-size:13px;font-weight:600;color:#1A1A1A;margin-bottom:2px;">${place.name}</div>
                            <div style="font-size:10px;color:#8A8478;margin-bottom:8px;">${place.city || ''}</div>
                            <a href="/place/${place.id}" style="display:block;text-align:center;padding:6px 0;background:#9B3A4A;color:#fff;text-decoration:none;border-radius:6px;font-size:11px;font-weight:600;">Scopri →</a>
                        </div>
                    </div>`);
                infoWindowRef.current.open(mapInstance.current, marker);
            });
            markersRef.current.push(marker);
        });

        // Fit bounds
        if (nearbyPlaces.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            nearbyPlaces.forEach(p => bounds.extend({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }));
            if (userLocation) bounds.extend(userLocation);
            mapInstance.current.fitBounds(bounds, 50); // Padding
        } else if (userLocation) {
            mapInstance.current.setCenter(userLocation);
            mapInstance.current.setZoom(15);
        }

    }, [nearbyPlaces, userLocation]);


    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F7F2EE' }}>
            {/* Header */}
            <div style={{ padding: '1.2rem', background: '#F7F2EE', zIndex: 10 }}>
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
                        <h1 className="serif" style={{ fontSize: '1.2rem', fontWeight: 500, margin: 0 }}>Mappa</h1>
                        <p style={{ fontSize: '0.55rem', color: '#B5AEA5', margin: 0 }}>
                            {nearbyPlaces.length} luoghi trovati
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="no-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                    {categories.map(cat => (
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
                            {categoryLabels[cat]}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                <style>{`.gm-style-cc,.gmnoprint:not(.gm-bundled-control),.gm-style a[href^="https://maps.google.com"]{display:none!important}.gm-style .gm-style-iw-c{border-radius:12px!important;box-shadow:0 4px 24px rgba(0,0,0,0.12)!important;padding:0!important}.gm-style .gm-style-iw-d{overflow:hidden!important}.gm-style .gm-style-iw-tc::after{display:none!important}`}</style>
            </div>
        </div>
    );
}
