import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Edit3, Trash2, Camera, Tag, FileText, X, Navigation, LocateFixed, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix per le icone di Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente per aggiornare la vista della mappa
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const TheVault = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addressSearch, setAddressSearch] = useState('');
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'RESTAURANT',
        city: '',
        address: '',
        description: '',
        hero_image: '',
        latitude: 45.4642,
        longitude: 9.1900,
        status: 'ACTIVE'
    });

    const categories = ['RESTAURANT', 'HOTEL', 'BAR', 'EXPERIENCE'];

    useEffect(() => {
        fetchVault();
    }, []);

    async function fetchVault() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('places')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPlaces(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'RESTAURANT',
            city: '',
            address: '',
            description: '',
            hero_image: '',
            latitude: 45.4642,
            longitude: 9.1900,
            status: 'ACTIVE'
        });
        setEditingId(null);
        setAddressSearch('');
        setIsAddOpen(false);
    };

    const handleEdit = (place) => {
        setFormData({
            name: place.name || '',
            category: place.category || 'RESTAURANT',
            city: place.city || '',
            address: place.address || '',
            description: place.description || '',
            hero_image: place.hero_image || '',
            latitude: place.latitude || 45.4642,
            longitude: place.longitude || 9.1900,
            status: place.status || 'ACTIVE'
        });
        setEditingId(place.id);
        setIsAddOpen(true);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `places/${fileName}`;

            // Caricamento su Supabase Storage (Assumiamo bucket 'media')
            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Recupero URL Pubblico
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, hero_image: publicUrl }));
            alert("File caricato correttamente!");
        } catch (err) {
            console.error("Upload error:", err);
            alert("Errore durante l'upload: " + err.message + "\nAssicurati che il bucket 'media' esista su Supabase.");
        } finally {
            setIsUploading(false);
        }
    };

    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearchChange = async (val) => {
        setAddressSearch(val);
        if (val.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`);
            const data = await response.json();
            setAddressSuggestions(data || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Autocomplete error:", err);
        }
    };

    const selectSuggestion = (s) => {
        const newLat = parseFloat(s.lat);
        const newLng = parseFloat(s.lon);

        const addr = s.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || '';
        const street = addr.road || '';
        const houseNumber = addr.house_number || '';
        const displayAddr = street ? `${street}${houseNumber ? ' ' + houseNumber : ''}` : s.display_name.split(',')[0];

        setFormData(prev => ({
            ...prev,
            address: displayAddr,
            city: city,
            latitude: newLat,
            longitude: newLng
        }));

        setAddressSearch(s.display_name);
        setAddressSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const placeData = {
                ...formData,
                latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null
            };

            if (editingId) {
                const { error } = await supabase
                    .from('places')
                    .update(placeData)
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('places')
                    .insert([placeData]);

                if (error) throw error;
            }

            resetForm();
            setTimeout(fetchVault, 500);
        } catch (err) {
            alert("Errore nell'operazione: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Sei sicuro di voler eliminare definitivamente questo posto dal Vault?")) return;

        // Aggiornamento ottimista UI
        const previousPlaces = [...places];
        setPlaces(prev => prev.filter(p => p.id !== id));

        try {
            const { error, status } = await supabase
                .from('places')
                .delete()
                .eq('id', id);

            if (error) {
                // Se c'è un errore, ripristiniamo la lista
                setPlaces(previousPlaces);
                throw error;
            }

            console.log("Delete success, status:", status);
            // Refresh silente per conferma
            fetchVault();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Errore database: " + err.message + "\nControlla se hai i permessi di eliminazione.");
        }
    };

    const filteredPlaces = places.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input
                            type="text"
                            placeholder="Cerca per nome o città..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.1)',
                                padding: '0.8rem 1rem 0.8rem 3rem',
                                color: '#1A0406',
                                fontSize: '0.8rem',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            background: '#FDFDFB',
                            fontSize: '0.8rem',
                            color: '#1A0406',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Tutte le categorie</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <button
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
                    style={{
                        backgroundColor: '#5D1219',
                        color: '#FDFDFB',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '2px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(93, 18, 25, 0.2)'
                    }}
                >
                    <Plus size={18} /> AGGIUNGI LUOGO
                </button>
            </div>

            {/* List Table */}
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#F8F8F5', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ padding: '1.2rem 2rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Immagine</th>
                            <th style={{ padding: '1.2rem 2rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Nome & Luogo</th>
                            <th style={{ padding: '1.2rem 2rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Categoria</th>
                            <th style={{ padding: '1.2rem 2rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, textAlign: 'right' }}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && places.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>Caricamento Vault...</td></tr>
                        ) : filteredPlaces.length > 0 ? (
                            filteredPlaces.map(place => (
                                <tr key={place.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                                            <img src={place.hero_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{place.name}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{place.city} {place.address && `— ${place.address}`}</div>
                                    </td>
                                    <td style={{ padding: '1rem 2rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#A68966', fontWeight: 600 }}>{place.category}</span>
                                    </td>
                                    <td style={{ padding: '1rem 2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(place)}
                                                style={{ background: 'none', border: 'none', color: '#A68966', cursor: 'pointer', padding: '0.5rem' }}
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(place.id)}
                                                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem' }}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>Nessun luogo trovato.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD/EDIT MODAL (OVERLAY) */}
            <AnimatePresence>
                {isAddOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(26, 4, 6, 0.8)',
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
                                maxWidth: '1100px',
                                maxHeight: '95vh',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                display: 'grid',
                                gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr'
                            }}
                        >
                            {/* Colonna Sinistra: Form */}
                            <div style={{ borderRight: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="serif" style={{ fontSize: '1.3rem', color: '#1A0406' }}>
                                        {editingId ? 'Modifica Luogo' : 'Nuovo Luogo nel Vault'}
                                    </h3>
                                    <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}><X size={24} /></button>
                                </div>

                                <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Nome Luogo</label>
                                            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="E.g. Indigo" style={{ width: '100%', padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Categoria</label>
                                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                        <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Ricerca Indirizzo Preciso</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={addressSearch}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                                                placeholder="Cerca su mappa... (es: Milano Brera)"
                                                style={{ flex: 1, padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }}
                                            />
                                            <div style={{ background: '#F8F8F5', border: '1px solid rgba(0,0,0,0.1)', padding: '0 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                                                <Search size={18} opacity={0.3} />
                                            </div>
                                        </div>

                                        {/* Suggerimenti Autocomplete */}
                                        <AnimatePresence>
                                            {showSuggestions && addressSuggestions.length > 0 && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        right: 0,
                                                        background: '#FFFFFF',
                                                        borderRadius: '4px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                                        zIndex: 3000,
                                                        listStyle: 'none',
                                                        padding: '0.5rem 0',
                                                        marginTop: '5px',
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                        border: '1px solid rgba(0,0,0,0.05)'
                                                    }}
                                                >
                                                    {addressSuggestions.map((s, idx) => (
                                                        <li
                                                            key={idx}
                                                            onClick={() => selectSuggestion(s)}
                                                            style={{
                                                                padding: '0.8rem 1.2rem',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid rgba(0,0,0,0.02)'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.background = '#F8F8F5'}
                                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            {s.display_name}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Indirizzo</label>
                                            <input required type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Via Milano, 1" style={{ width: '100%', padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Città</label>
                                            <input required type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Milano" style={{ width: '100%', padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Foto o Video (Upload diretto)</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={isUploading}
                                                style={{
                                                    flex: 1,
                                                    padding: '1.2rem',
                                                    border: '2px dashed rgba(93, 18, 25, 0.2)',
                                                    borderRadius: '4px',
                                                    background: '#F8F8F5',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.8rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: '#5D1219'
                                                }}
                                            >
                                                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                                {isUploading ? 'CARICAMENTO...' : 'CARICA DA CELLULARE / PC'}
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                                accept="image/*,video/*"
                                            />
                                        </div>
                                        {formData.hero_image && (
                                            <div style={{ marginTop: '1rem', position: 'relative' }}>
                                                <div style={{ fontSize: '0.55rem', opacity: 0.4, marginBottom: '0.5rem' }}>ANTEPRIMA MEDIA:</div>
                                                <div style={{ width: '100%', height: '120px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                                                    {formData.hero_image.includes('.mp4') || formData.hero_image.includes('video') ? (
                                                        <video src={formData.hero_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <img src={formData.hero_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.55rem', textTransform: 'uppercase', opacity: 0.3, marginBottom: '0.3rem' }}>O inserisci URL manualmente</label>
                                            <input type="url" value={formData.hero_image} onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '0.6rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', fontSize: '0.7rem' }} />
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '0.5rem' }}>Descrizione</label>
                                        <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Descrizione editoriale..." style={{ width: '100%', padding: '0.7rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', resize: 'none' }} />
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ width: '100%', backgroundColor: '#1A0406', color: '#FDFDFB', border: 'none', padding: '1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}
                                    >
                                        {editingId ? 'SALVA MODIFICHE' : 'PUBBLICA NEL VAULT'}
                                    </button>
                                </form>
                            </div>

                            {/* Colonna Destra: Mappa */}
                            <div style={{ position: 'relative', height: '100%' }}>
                                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 1000, background: '#FDFDFB', padding: '0.5rem 1rem', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: '0.7rem', color: '#5D1219', fontWeight: 700 }}>
                                    POSIZIONE: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                                </div>
                                <MapContainer
                                    center={[formData.latitude, formData.longitude]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                    <Marker position={[formData.latitude, formData.longitude]} />
                                    <ChangeView center={[formData.latitude, formData.longitude]} zoom={15} />
                                </MapContainer>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default TheVault;
