import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getMapStyle, CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/mapSetup';
import { SlidersHorizontal, X, MapPin } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function FullMap() {
    const navigate = useNavigate();
    const [placeCount, setPlaceCount] = useState(0);
    const [category, setCategory] = useState('ALL');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const popupRef = useRef(null);
    const fetchTimerRef = useRef(null);
    const initialBoundsSet = useRef(false);
    const loadedImages = useRef(new Set());

    const categories = ['ALL', 'RESTAURANT', 'ROOFTOP', 'HOTEL', 'BREAKFAST_BAR', 'COCKTAIL_BAR'];
    const categoryLabels = {
        'ALL': 'Tutti', 'RESTAURANT': 'Ristoranti', 'ROOFTOP': 'Roof Top',
        'HOTEL': 'Hotel', 'BREAKFAST_BAR': 'Colazione', 'COCKTAIL_BAR': 'Cocktail Bar'
    };

    // Constant for Luxury Pin SVG
    const createPinSVG = (color, iconPath) => {
        const svg = `
        <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 46L13 37C7.5 30 4 25.5 4 18C4 9.16 11.16 2 20 2C28.84 2 36 9.16 36 18C36 25.5 32 30 26.5 37.5L20 46Z" fill="${color}" stroke="white" stroke-width="1.5"/>
            <g transform="translate(8, 8)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    ${iconPath}
                </svg>
            </g>
        </svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Load custom images into MapLibre
    const loadMarkerImages = (map) => {
        Object.entries(CATEGORY_COLORS).forEach(([cat, color]) => {
            if (loadedImages.current.has(cat)) return;
            const icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.DEFAULT;
            const img = new Image();
            img.onload = () => {
                if (!map.hasImage(`pin-${cat}`)) {
                    map.addImage(`pin-${cat}`, img);
                    loadedImages.current.add(cat);
                }
            };
            img.src = createPinSVG(color, icon);
        });
    };

    // Fetch places within bounds
    const fetchVisiblePlaces = useCallback(async (bounds) => {
        if (!bounds || !mapInstance.current) return;
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Round bounds to reduce cache misses and tiny movements
        const cacheKey = `v3_${Math.round(sw.lat * 20)}_${Math.round(sw.lng * 20)}_${Math.round(ne.lat * 20)}_${Math.round(ne.lng * 20)}_${category}`;

        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                updateSource(data);
                return;
            }
        } catch { }

        let query = supabase.from('places')
            .select('id, name, category, latitude, longitude, city')
            .eq('status', 'ACTIVE')
            .gte('latitude', sw.lat - 0.01).lte('latitude', ne.lat + 0.01) // Slight buffer for smoother dragging
            .gte('longitude', sw.lng - 0.01).lte('longitude', ne.lng + 0.01);

        if (category !== 'ALL') query = query.eq('category', category);

        const { data, error } = await query.limit(400);
        if (error) return;

        const places = data || [];
        updateSource(places);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(places)); } catch { }
    }, [category]);

    const updateSource = (places) => {
        if (!mapInstance.current) return;
        const source = mapInstance.current.getSource('places');
        if (!source) return;

        setPlaceCount(places.length);
        const geojson = {
            type: 'FeatureCollection',
            features: places.map(p => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [parseFloat(p.longitude), parseFloat(p.latitude)] },
                properties: { ...p }
            }))
        };
        source.setData(geojson);
    };

    // Popups based on GeoJSON properties
    const showPopup = (props, lngLat) => {
        if (popupRef.current) popupRef.current.remove();

        const color = CATEGORY_COLORS[props.category] || CATEGORY_COLORS.DEFAULT;

        popupRef.current = new maplibregl.Popup({
            offset: 25, closeButton: true, closeOnClick: true,
            maxWidth: '240px', className: 'premium-popup'
        })
            .setLngLat(lngLat)
            .setHTML(`
            <div style="font-family:var(--font-sans, 'Inter', sans-serif);padding:14px 16px;">
                <div style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:4px;letter-spacing:-0.01em;">${props.name}</div>
                <div style="font-size:11px;color:#8A8478;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">${props.city || ''}</div>
                <a href="/place/${props.id}" style="display:block;text-align:center;padding:10px 0;background:${color};color:#fff;text-decoration:none;border-radius:10px;font-size:12px;font-weight:600;transition:opacity 0.2s;">Scopri di più →</a>
            </div>
        `)
            .addTo(mapInstance.current);
    };

    // Initialization
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const map = new maplibregl.Map({
            container: mapRef.current,
            style: getMapStyle(),
            center: [9.19, 45.46],
            zoom: 13,
            attributionControl: false,
            maxZoom: 18,
            minZoom: 3,
            antialias: true
        });

        mapInstance.current = map;

        map.on('load', () => {
            loadMarkerImages(map);

            map.addSource('places', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50
            });

            // Luxury Clusters
            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'places',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#1A1614',
                    'circle-radius': ['step', ['get', 'point_count'], 22, 10, 26, 50, 32],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#D4A86A'
                }
            });

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'places',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-size': 13
                },
                paint: { 'text-color': '#D4A86A' }
            });

            // Luxury Pins (Symbol Layer)
            map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'places',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': ['concat', 'pin-', ['get', 'category']],
                    'icon-size': 0.75,
                    'icon-allow-overlap': true,
                    'icon-anchor': 'bottom'
                }
            });

            // Interactions
            map.on('click', 'clusters', (e) => {
                const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                const clusterId = features[0].properties.cluster_id;
                map.getSource('places').getClusterExpansionZoom(clusterId, (err, zoom) => {
                    if (err) return;
                    map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom + 1 });
                });
            });

            map.on('click', 'unclustered-point', (e) => {
                const feature = e.features[0];
                const coordinates = feature.geometry.coordinates.slice();
                showPopup(feature.properties, coordinates);
            });

            map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');
            map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');

            // Initial Position
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(p => {
                    const loc = [p.coords.longitude, p.coords.latitude];
                    map.flyTo({ center: loc, zoom: 14 });

                    // User location dot
                    const el = document.createElement('div');
                    el.style.cssText = 'width:20px;height:20px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(66,133,244,0.3);';
                    new maplibregl.Marker({ element: el }).setLngLat(loc).addTo(map);
                }, () => fetchVisiblePlaces(map.getBounds()));
            } else {
                fetchVisiblePlaces(map.getBounds());
            }
        });

        map.on('moveend', () => {
            clearTimeout(fetchTimerRef.current);
            fetchTimerRef.current = setTimeout(() => {
                fetchVisiblePlaces(map.getBounds());
            }, 100); // Shorter debounce for "silky" feel
        });

        // Re-fetch on theme change (re-loads style)
        const transitionTheme = () => {
            map.setStyle(getMapStyle());
            loadedImages.current.clear(); // Re-trigger image load for new style
            map.once('style.load', () => loadMarkerImages(map));
        };

        const observer = new MutationObserver(transitionTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        return () => {
            map.remove();
            observer.disconnect();
            mapInstance.current = null;
        };
    }, []);

    // Re-fetch category change
    useEffect(() => {
        if (mapInstance.current?.loaded()) fetchVisiblePlaces(mapInstance.current.getBounds());
    }, [category]);

    const centerOnMe = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(p => {
                mapInstance.current?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 14, duration: 800 });
            });
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, background: 'var(--bg-primary, #1A1614)' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

            <div style={{
                position: 'absolute', top: '16px', left: '16px',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
                borderRadius: '16px', padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
            }}>
                <MapPin size={15} color="#D4A86A" />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>
                    {placeCount} posti trovati
                </span>
            </div>

            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setFiltersOpen(!filtersOpen)}
                style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '46px', height: '46px', borderRadius: '16px',
                    background: filtersOpen ? 'linear-gradient(135deg, #D4A86A, #B88B4A)' : 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
                }}
            >
                {filtersOpen ? <X size={18} color="#fff" /> : <SlidersHorizontal size={18} color="#D4A86A" />}
            </motion.button>

            <AnimatePresence>
                {filtersOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'absolute', top: '78px', right: '16px',
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(24px)',
                            borderRadius: '20px', padding: '14px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px'
                        }}
                    >
                        {categories.map(cat => (
                            <motion.button key={cat} whileTap={{ scale: 0.97 }}
                                onClick={() => { setCategory(cat); setFiltersOpen(false); }}
                                style={{
                                    padding: '12px 16px', borderRadius: '12px', border: 'none',
                                    background: category === cat ? 'rgba(212,168,106,0.2)' : 'transparent',
                                    color: category === cat ? '#D4A86A' : 'rgba(255,255,255,0.6)',
                                    fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left'
                                }}
                            >
                                {categoryLabels[cat]}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.9 }} onClick={centerOnMe}
                style={{
                    position: 'absolute', bottom: '90px', right: '16px',
                    width: '46px', height: '46px', borderRadius: '16px',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
                }}
            >
                <NavIcon size={18} color="#D4A86A" />
            </motion.button>

            <style>{`
                .premium-popup .maplibregl-popup-content { border-radius: 18px !important; box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important; padding: 0 !important; border: 1px solid rgba(0,0,0,0.05); }
                .premium-popup .maplibregl-popup-tip { border-top-color: #fff !important; }
                .maplibregl-ctrl-attrib { display: none !important; }
            `}</style>
        </div>
    );
}

function NavIcon({ size, color }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>;
}
