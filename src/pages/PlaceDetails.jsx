import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Globe, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PlaceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlace();
    }, [id]);

    async function fetchPlace() {
        setLoading(true);
        const { data, error } = await supabase
            .from('places')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching place:', error);
            navigate('/');
        } else {
            setPlace(data);
        }
        setLoading(false);
    }

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p style={{ letterSpacing: '0.2em', opacity: 0.5 }} className="serif">Caricamento scheda...</p>
        </div>
    );

    if (!place) return null;

    return (
        <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ivory)',
                    padding: '1.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    opacity: 0.6
                }}
            >
                <ChevronLeft size={18} />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Indietro</span>
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#1A1A1A' }}
            >
                <img
                    src={place.hero_image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000'}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </motion.div>

            <div style={{ padding: '2.5rem 0 1.5rem 0' }}>
                <p style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--ivory)',
                    opacity: 0.5,
                    marginBottom: '0.5rem'
                }}>
                    {place.category}
                </p>
                <h1 style={{ fontSize: '2.8rem', margin: '0 0 1.5rem 0' }}>{place.name}</h1>
                <div style={{ borderLeft: '1px solid var(--dark-bordeaux)', paddingLeft: '1.5rem', margin: '2rem 0' }}>
                    <p className="serif" style={{ fontSize: '1.25rem', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.8' }}>
                        "{place.description}"
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '0.8rem', marginTop: '2rem' }}>
                {place.maps_url && (
                    <a href={place.maps_url} target="_blank" rel="noopener noreferrer" className="luxury-button">
                        <MapPin size={16} /> Open in Maps
                    </a>
                )}
                {place.website_url && (
                    <a href={place.website_url} target="_blank" rel="noopener noreferrer" className="luxury-button">
                        <Globe size={16} /> Visit Website
                    </a>
                )}
                {place.phone && (
                    <a href={`tel:${place.phone}`} className="luxury-button">
                        <Phone size={16} /> Call
                    </a>
                )}
            </div>
        </div>
    );
};

export default PlaceDetails;
