import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit3, Trash2, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PlaceWizard from '../../components/PlaceWizard';

const TheVault = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [priceFilter, setPriceFilter] = useState('ALL');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);

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

    const handleEdit = (place) => {
        setEditingPlace(place);
        setIsWizardOpen(true);
    };

    const handleAddNew = () => {
        setEditingPlace(null);
        setIsWizardOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Sei sicuro di voler eliminare definitivamente questo posto?")) return;

        const previousPlaces = [...places];
        setPlaces(prev => prev.filter(p => p.id !== id));

        try {
            const { error } = await supabase
                .from('places')
                .delete()
                .eq('id', id);

            if (error) {
                setPlaces(previousPlaces);
                throw error;
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Errore: " + err.message);
        }
    };

    const filteredPlaces = places.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase()) ||
            p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
        const matchesPrice = priceFilter === 'ALL' || p.price_range === priceFilter;
        return matchesSearch && matchesCat && matchesPrice;
    });

    const getCategoryEmoji = (cat) => {
        switch (cat) {
            case 'RESTAURANT': return '🍽️';
            case 'HOTEL': return '🏨';
            case 'BAR': return '🍸';
            case 'EXPERIENCE': return '⭐';
            default: return '📍';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input
                            type="text"
                            placeholder="Cerca per nome, città o tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.1)',
                                padding: '0.8rem 1rem 0.8rem 3rem',
                                color: '#1A0406',
                                fontSize: '0.8rem',
                                borderRadius: '8px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            background: '#FDFDFB',
                            fontSize: '0.8rem',
                            color: '#1A0406',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Tutte le categorie</option>
                        {categories.map(c => <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>)}
                    </select>

                    {/* Price Filter */}
                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '8px',
                            background: '#FDFDFB',
                            fontSize: '0.8rem',
                            color: '#1A0406',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Tutti i prezzi</option>
                        <option value="€">€ Economico</option>
                        <option value="€€">€€ Medio</option>
                        <option value="€€€">€€€ Medio-Alto</option>
                        <option value="€€€€">€€€€ Alto</option>
                        <option value="€€€€€">€€€€€ Luxury</option>
                    </select>
                </div>

                <button
                    onClick={handleAddNew}
                    style={{
                        backgroundColor: '#5D1219',
                        color: '#FDFDFB',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(93, 18, 25, 0.25)'
                    }}
                >
                    <Plus size={18} /> AGGIUNGI LUOGO
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1rem' }}>
                {categories.map(cat => {
                    const count = places.filter(p => p.category === cat).length;
                    return (
                        <div
                            key={cat}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
                            style={{
                                padding: '1rem 1.5rem',
                                background: categoryFilter === cat ? '#5D1219' : 'white',
                                color: categoryFilter === cat ? 'white' : '#1A0406',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{getCategoryEmoji(cat)}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{count}</div>
                            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>{cat}</div>
                        </div>
                    );
                })}
            </div>

            {/* Places Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
                        Caricamento...
                    </div>
                ) : filteredPlaces.length > 0 ? (
                    filteredPlaces.map(place => (
                        <motion.div
                            key={place.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                            }}
                        >
                            {/* Image */}
                            <div style={{
                                height: '180px',
                                background: '#F0F0EE',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {place.hero_image ? (
                                    <img
                                        src={place.hero_image}
                                        alt={place.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '3rem', opacity: 0.3
                                    }}>
                                        {getCategoryEmoji(place.category)}
                                    </div>
                                )}

                                {/* Category Badge */}
                                <div style={{
                                    position: 'absolute', top: '0.8rem', left: '0.8rem',
                                    background: 'rgba(0,0,0,0.7)', color: 'white',
                                    padding: '0.3rem 0.8rem', borderRadius: '4px',
                                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em'
                                }}>
                                    {getCategoryEmoji(place.category)} {place.category}
                                </div>

                                {/* Price Badge */}
                                {place.price_range && (
                                    <div style={{
                                        position: 'absolute', top: '0.8rem', right: '0.8rem',
                                        background: '#5D1219', color: 'white',
                                        padding: '0.3rem 0.6rem', borderRadius: '4px',
                                        fontSize: '0.7rem', fontWeight: 700
                                    }}>
                                        {place.price_range}
                                    </div>
                                )}

                                {/* Gallery count */}
                                {place.gallery?.length > 1 && (
                                    <div style={{
                                        position: 'absolute', bottom: '0.8rem', right: '0.8rem',
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        padding: '0.3rem 0.6rem', borderRadius: '4px',
                                        fontSize: '0.6rem'
                                    }}>
                                        📷 {place.gallery.length}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem', color: '#1A0406' }}>
                                    {place.name}
                                </h3>
                                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <MapPin size={12} />
                                    {place.city} {place.address && `— ${place.address}`}
                                </div>

                                {/* Tags */}
                                {place.tags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                                        {place.tags.slice(0, 4).map(tag => (
                                            <span
                                                key={tag}
                                                style={{
                                                    background: '#F8F8F5',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.6rem',
                                                    color: '#5D1219',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {place.tags.length > 4 && (
                                            <span style={{ fontSize: '0.6rem', opacity: 0.4 }}>+{place.tags.length - 4}</span>
                                        )}
                                    </div>
                                )}

                                {/* Phone */}
                                {place.phone && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Phone size={12} /> {place.phone}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                    <button
                                        onClick={() => handleEdit(place)}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: '#A68966', cursor: 'pointer',
                                            padding: '0.5rem',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            fontSize: '0.7rem', fontWeight: 600
                                        }}
                                    >
                                        <Edit3 size={16} /> Modifica
                                    </button>
                                    <button
                                        onClick={() => handleDelete(place.id)}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: '#cc4444', cursor: 'pointer',
                                            padding: '0.5rem',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            fontSize: '0.7rem', fontWeight: 600
                                        }}
                                    >
                                        <Trash2 size={16} /> Elimina
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.4 }}>
                        Nessun luogo trovato.
                    </div>
                )}
            </div>

            {/* Place Wizard */}
            <PlaceWizard
                isOpen={isWizardOpen}
                onClose={() => {
                    setIsWizardOpen(false);
                    setEditingPlace(null);
                }}
                editingPlace={editingPlace}
                onSave={fetchVault}
            />
        </div>
    );
};

export default TheVault;
