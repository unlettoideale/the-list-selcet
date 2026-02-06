import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchOverlay = ({ isOpen, onClose, onSearch }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) setQuery('');
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            onClose();
        }
    };

    const quickSearches = ['Milano', 'Roma', 'Paris', 'London', 'Dubai'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(26, 4, 6, 0.98)',
                        backdropFilter: 'blur(15px)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '2rem'
                    }}
                >
                    {/* Header Overlay */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--ivory)', padding: '1rem' }}
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={20}
                                color="var(--ivory)"
                                style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                            />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Cerca città o luogo..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    padding: '1.5rem 2.5rem',
                                    color: 'var(--ivory)',
                                    fontSize: '1.5rem',
                                    fontFamily: 'var(--font-serif)',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </form>

                    {/* Suggestions */}
                    <div style={{ width: '100%', maxWidth: '600px', margin: '4rem auto' }}>
                        <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.3, marginBottom: '2rem' }}>
                            Ricerche suggerite
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {quickSearches.map(city => (
                                <button
                                    key={city}
                                    onClick={() => {
                                        onSearch(city);
                                        onClose();
                                    }}
                                    style={{
                                        background: 'rgba(245, 245, 240, 0.05)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '30px',
                                        padding: '0.6rem 1.2rem',
                                        color: 'var(--ivory)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginTop: '5rem' }}>
                            <button
                                onClick={() => {
                                    // Handle geo location search if needed
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gold)',
                                    fontSize: '0.9rem',
                                    opacity: 0.8
                                }}
                            >
                                <Navigation size={18} />
                                <span>Cerca vicino a me</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
