import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Camera, Star, ChevronLeft, ChevronRight, GripVertical, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente per aggiornare la vista della mappa
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Tags per ogni categoria
const CATEGORY_TAGS = {
    RESTAURANT: [
        'Fine Dining', 'Trattoria', 'Bistrot', 'Pizzeria', 'Sushi',
        'Pesce', 'Carne', 'Vegetariano', 'Vegano', 'Brunch',
        'Street Food', 'Etnico', 'Stellato', 'Vista', 'Romantico'
    ],
    HOTEL: [
        'Boutique', 'Luxury', 'Design', 'B&B', 'Resort',
        'Spa', 'Romantico', 'Business', 'Famiglia', 'Pet Friendly',
        'Centro Storico', 'Vista Mare', 'Piscina', 'Rooftop'
    ],
    BAR: [
        'Cocktail Bar', 'Wine Bar', 'Speakeasy', 'Rooftop', 'Pub',
        'Lounge', 'Aperitivo', 'Live Music', 'DJ Set', 'Vista',
        'Intimo', 'Trendy', 'Storico'
    ],
    EXPERIENCE: [
        'Outdoor', 'Arte', 'Musica', 'Sport', 'Wellness',
        'Tour', 'Evento', 'Workshop', 'Degustazione', 'Avventura',
        'Cultura', 'Romantico', 'Famiglia', 'Notturno'
    ]
};

const PRICE_RANGES = ['€', '€€', '€€€', '€€€€', '€€€€€'];

const PlaceWizard = ({ isOpen, onClose, editingPlace, onSave }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [addressSearch, setAddressSearch] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'RESTAURANT',
        city: '',
        address: '',
        phone: '',
        description: '',
        hero_image: '',
        gallery: [],
        latitude: 45.4642,
        longitude: 9.1900,
        price_range: '€€',
        tags: [],
        status: 'ACTIVE'
    });

    // Inizializza Google Places
    useEffect(() => {
        if (window.google && window.google.maps) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            const dummyDiv = document.createElement('div');
            placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        }
    }, []);

    // Carica dati se editing
    useEffect(() => {
        if (editingPlace) {
            setFormData({
                name: editingPlace.name || '',
                category: editingPlace.category || 'RESTAURANT',
                city: editingPlace.city || '',
                address: editingPlace.address || '',
                phone: editingPlace.phone || '',
                description: editingPlace.description || '',
                hero_image: editingPlace.hero_image || '',
                gallery: editingPlace.gallery || [],
                latitude: editingPlace.latitude || 45.4642,
                longitude: editingPlace.longitude || 9.1900,
                price_range: editingPlace.price_range || '€€',
                tags: editingPlace.tags || [],
                status: editingPlace.status || 'ACTIVE'
            });
            setAddressSearch(editingPlace.address || '');
        } else {
            resetForm();
        }
        setCurrentStep(1);
    }, [editingPlace, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'RESTAURANT',
            city: '',
            address: '',
            phone: '',
            description: '',
            hero_image: '',
            gallery: [],
            latitude: 45.4642,
            longitude: 9.1900,
            price_range: '€€',
            tags: [],
            status: 'ACTIVE'
        });
        setAddressSearch('');
        setCurrentStep(1);
    };

    // Google Places Autocomplete
    const handleSearchChange = async (val) => {
        setAddressSearch(val);
        if (val.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                {
                    input: val,
                    componentRestrictions: { country: 'it' },
                    types: ['establishment', 'geocode']
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setAddressSuggestions(predictions);
                        setShowSuggestions(true);
                    } else {
                        setAddressSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
        }
    };

    const selectSuggestion = (suggestion) => {
        if (placesService.current) {
            placesService.current.getDetails(
                {
                    placeId: suggestion.place_id,
                    fields: ['geometry', 'formatted_address', 'address_components', 'name', 'formatted_phone_number']
                },
                (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        let city = '';
                        let streetAddress = '';

                        if (place.address_components) {
                            for (const component of place.address_components) {
                                if (component.types.includes('locality')) city = component.long_name;
                                if (component.types.includes('route')) streetAddress = component.long_name;
                                if (component.types.includes('street_number')) streetAddress += ' ' + component.long_name;
                            }
                        }

                        setFormData(prev => ({
                            ...prev,
                            name: prev.name || place.name || '',
                            address: streetAddress || place.formatted_address?.split(',')[0] || '',
                            city: city || '',
                            phone: place.formatted_phone_number || prev.phone || '',
                            latitude: lat,
                            longitude: lng
                        }));

                        setAddressSearch(place.formatted_address || suggestion.description);
                        setAddressSuggestions([]);
                        setShowSuggestions(false);
                    }
                }
            );
        }
    };

    // File Upload
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        setIsUploading(true);
        try {
            const uploadedUrls = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `places/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('media')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            setFormData(prev => ({
                ...prev,
                hero_image: prev.hero_image || uploadedUrls[0],
                gallery: [...prev.gallery, ...uploadedUrls]
            }));

        } catch (err) {
            console.error("Upload error:", err);
            alert("Errore durante l'upload: " + err.message);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    // Set hero image
    const setAsHero = (url) => {
        setFormData(prev => ({ ...prev, hero_image: url }));
    };

    // Remove from gallery
    const removeFromGallery = (index) => {
        setFormData(prev => {
            const newGallery = [...prev.gallery];
            const removed = newGallery.splice(index, 1)[0];
            return {
                ...prev,
                gallery: newGallery,
                hero_image: prev.hero_image === removed ? (newGallery[0] || '') : prev.hero_image
            };
        });
    };

    // Drag and drop reorder
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setFormData(prev => {
            const newGallery = [...prev.gallery];
            const draggedItem = newGallery[draggedIndex];
            newGallery.splice(draggedIndex, 1);
            newGallery.splice(index, 0, draggedItem);
            setDraggedIndex(index);
            return { ...prev, gallery: newGallery };
        });
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Toggle tag
    const toggleTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    // Submit
    const handleSubmit = async () => {
        try {
            const placeData = {
                ...formData,
                latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null
            };

            if (editingPlace) {
                const { error } = await supabase
                    .from('places')
                    .update(placeData)
                    .eq('id', editingPlace.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('places')
                    .insert([placeData]);
                if (error) throw error;
            }

            onSave();
            onClose();
            resetForm();
        } catch (err) {
            alert("Errore: " + err.message);
        }
    };

    const canProceed = () => {
        if (currentStep === 1) return formData.name && formData.address && formData.city;
        if (currentStep === 2) return formData.gallery.length > 0;
        if (currentStep === 3) return formData.description && formData.tags.length > 0;
        return true;
    };

    const steps = [
        { num: 1, label: 'Informazioni' },
        { num: 2, label: 'Media' },
        { num: 3, label: 'Dettagli' }
    ];

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(26, 4, 6, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 2000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                    background: '#FDFDFB',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header con Steps */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    background: '#F8F8F5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="serif" style={{ fontSize: '1.4rem', color: '#1A0406' }}>
                            {editingPlace ? 'Modifica Luogo' : 'Nuovo Luogo'}
                        </h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {steps.map((step, idx) => (
                            <div key={step.num} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: currentStep >= step.num ? '#5D1219' : 'rgba(0,0,0,0.1)',
                                    color: currentStep >= step.num ? 'white' : '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    marginBottom: '0.5rem'
                                }}>
                                    {step.num}
                                </div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: currentStep === step.num ? 1 : 0.5 }}>
                                    {step.label}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: `calc(${(idx + 1) * 33.33}% - 10%)`,
                                        top: '50%',
                                        width: '20%',
                                        height: '2px',
                                        background: currentStep > step.num ? '#5D1219' : 'rgba(0,0,0,0.1)'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <AnimatePresence mode="wait">
                        {/* STEP 1: Informazioni Base */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{ display: 'grid', gap: '1.5rem' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Nome Luogo *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Es: Langosteria"
                                            style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Categoria *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value, tags: [] })}
                                            style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}
                                        >
                                            <option value="RESTAURANT">🍽️ Restaurant</option>
                                            <option value="HOTEL">🏨 Hotel</option>
                                            <option value="BAR">🍸 Bar</option>
                                            <option value="EXPERIENCE">⭐ Experience</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>
                                        <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        Cerca Indirizzo *
                                    </label>
                                    <input
                                        type="text"
                                        value={addressSearch}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                                        placeholder="Cerca su Google Maps..."
                                        style={{ width: '100%', padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />

                                    {showSuggestions && addressSuggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            background: 'white', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                            zIndex: 100, listStyle: 'none', padding: '0.5rem 0', marginTop: '4px',
                                            maxHeight: '200px', overflowY: 'auto'
                                        }}>
                                            {addressSuggestions.map((s, idx) => (
                                                <li
                                                    key={s.place_id || idx}
                                                    onClick={() => selectSuggestion(s)}
                                                    style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}
                                                    onMouseEnter={(e) => e.target.style.background = '#F8F8F5'}
                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                >
                                                    {s.description}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Indirizzo</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Città</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>
                                            <Phone size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            Telefono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+39..."
                                            style={{ width: '100%', padding: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Mini Mappa */}
                                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                                    <MapContainer
                                        center={[formData.latitude, formData.longitude]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                        <Marker position={[formData.latitude, formData.longitude]} />
                                        <ChangeView center={[formData.latitude, formData.longitude]} zoom={15} />
                                    </MapContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Media Editor */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isUploading}
                                    style={{
                                        width: '100%',
                                        padding: '2rem',
                                        border: '2px dashed rgba(93, 18, 25, 0.3)',
                                        borderRadius: '12px',
                                        background: '#F8F8F5',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} color="#5D1219" />}
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5D1219' }}>
                                        {isUploading ? 'Caricamento in corso...' : 'Clicca per caricare foto e video'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Puoi selezionare più file</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*,video/*"
                                    multiple
                                />

                                {/* Gallery Editor */}
                                {formData.gallery.length > 0 && (
                                    <>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '1rem' }}>
                                            Galleria ({formData.gallery.length} file) — Trascina per riordinare, clicca ⭐ per impostare copertina
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {formData.gallery.map((url, idx) => (
                                                <div
                                                    key={idx}
                                                    draggable
                                                    onDragStart={() => handleDragStart(idx)}
                                                    onDragOver={(e) => handleDragOver(e, idx)}
                                                    onDragEnd={handleDragEnd}
                                                    style={{
                                                        position: 'relative',
                                                        aspectRatio: '4/3',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        border: formData.hero_image === url ? '3px solid #5D1219' : '1px solid rgba(0,0,0,0.1)',
                                                        cursor: 'grab'
                                                    }}
                                                >
                                                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                                    {/* Hero badge */}
                                                    {formData.hero_image === url && (
                                                        <div style={{
                                                            position: 'absolute', top: '0.5rem', left: '0.5rem',
                                                            background: '#5D1219', color: 'white',
                                                            padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                            fontSize: '0.55rem', fontWeight: 700
                                                        }}>
                                                            COPERTINA
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div style={{
                                                        position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                                                        display: 'flex', gap: '0.3rem'
                                                    }}>
                                                        <button
                                                            onClick={() => setAsHero(url)}
                                                            style={{
                                                                background: 'rgba(0,0,0,0.6)', border: 'none',
                                                                color: formData.hero_image === url ? '#FFD700' : 'white',
                                                                width: '28px', height: '28px', borderRadius: '4px',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                            title="Imposta come copertina"
                                                        >
                                                            <Star size={14} fill={formData.hero_image === url ? '#FFD700' : 'transparent'} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromGallery(idx)}
                                                            style={{
                                                                background: 'rgba(200,0,0,0.8)', border: 'none',
                                                                color: 'white', width: '28px', height: '28px', borderRadius: '4px',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                            title="Rimuovi"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Drag handle */}
                                                    <div style={{
                                                        position: 'absolute', top: '0.5rem', right: '0.5rem',
                                                        background: 'rgba(0,0,0,0.4)', padding: '0.3rem',
                                                        borderRadius: '4px', color: 'white'
                                                    }}>
                                                        <GripVertical size={14} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {formData.gallery.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                                        <Camera size={48} strokeWidth={1} />
                                        <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Nessun media caricato</div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 3: Dettagli & Filtri */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{ display: 'grid', gap: '2rem' }}
                            >
                                {/* Descrizione */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>
                                        Descrizione Editoriale *
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descrivi l'atmosfera, cosa lo rende speciale, perché lo consigli..."
                                        rows={4}
                                        style={{
                                            width: '100%', padding: '1rem',
                                            border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px',
                                            fontSize: '0.9rem', resize: 'none'
                                        }}
                                    />
                                </div>

                                {/* Fascia Prezzo */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.8rem' }}>
                                        Fascia di Prezzo
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {PRICE_RANGES.map(price => (
                                            <button
                                                key={price}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, price_range: price })}
                                                style={{
                                                    flex: 1,
                                                    padding: '1rem',
                                                    border: formData.price_range === price ? '2px solid #5D1219' : '1px solid rgba(0,0,0,0.1)',
                                                    borderRadius: '8px',
                                                    background: formData.price_range === price ? '#5D1219' : 'white',
                                                    color: formData.price_range === price ? 'white' : '#1A0406',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {price}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.6rem', opacity: 0.4 }}>
                                        <span>Economico</span>
                                        <span>Molto Costoso</span>
                                    </div>
                                </div>

                                {/* Tags per Categoria */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.8rem' }}>
                                        Caratteristiche ({formData.tags.length} selezionate) *
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {CATEGORY_TAGS[formData.category]?.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                style={{
                                                    padding: '0.6rem 1rem',
                                                    border: formData.tags.includes(tag) ? 'none' : '1px solid rgba(0,0,0,0.15)',
                                                    borderRadius: '20px',
                                                    background: formData.tags.includes(tag) ? '#5D1219' : 'white',
                                                    color: formData.tags.includes(tag) ? 'white' : '#1A0406',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer con navigazione */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#F8F8F5'
                }}>
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={currentStep === 1}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.8rem 1.5rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentStep === 1 ? 0.3 : 1,
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}
                    >
                        <ChevronLeft size={18} /> Indietro
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={!canProceed()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.8rem 2rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: canProceed() ? '#5D1219' : 'rgba(0,0,0,0.1)',
                                color: canProceed() ? 'white' : '#666',
                                cursor: canProceed() ? 'pointer' : 'not-allowed',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em'
                            }}
                        >
                            Continua <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                            style={{
                                padding: '0.8rem 2.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                background: canProceed() ? '#1A0406' : 'rgba(0,0,0,0.1)',
                                color: canProceed() ? 'white' : '#666',
                                cursor: canProceed() ? 'pointer' : 'not-allowed',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em'
                            }}
                        >
                            {editingPlace ? 'SALVA MODIFICHE' : 'PUBBLICA'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PlaceWizard;
