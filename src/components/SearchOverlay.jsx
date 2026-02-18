import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search } from 'lucide-react';

const SearchOverlay = ({ isOpen, onClose, onSearch }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (q) => {
        const searchQuery = q || query;
        if (searchQuery.trim()) {
            if (searchQuery === '__nearby__') {
                onSearch(''); // Clear global query
                navigate('/nearby'); // SPA navigation
            } else {
                onSearch(searchQuery.trim());
            }
            onClose();
        }
    };

    const quickSearch = ['Ristoranti', 'Roof Top', 'Hotel', 'Colazione', 'Cocktail Bar'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: '64px',
                        zIndex: 2500,
                        background: 'var(--overlay-bg)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        display: 'flex', flexDirection: 'column',
                        overflowY: 'auto'
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        style={{ padding: '2rem 1.5rem' }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="serif" style={{ fontSize: '1.4rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>Cerca</h2>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--text-primary)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                <X size={18} strokeWidth={1.5} />
                            </motion.button>
                        </div>

                        {/* Search Input */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            background: 'var(--bg-elevated)', borderRadius: '14px',
                            padding: '0.9rem 1rem', marginBottom: '2rem',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'all 0.3s ease'
                        }}>
                            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nome, città, categoria..."
                                autoFocus
                                style={{
                                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                                    color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Quick searches */}
                        <div>
                            <p style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>
                                Ricerche suggerite
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {quickSearch.map((item, idx) => (
                                    <motion.button key={item}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.06 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setQuery(item); handleSearch(item); }}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '20px',
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                            color: 'var(--text-primary)', fontSize: '0.7rem', fontWeight: 500,
                                            cursor: 'pointer', transition: 'all 0.3s ease',
                                            boxShadow: 'var(--shadow-xs)'
                                        }}
                                    >
                                        {item}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Location button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { onSearch('__nearby__'); onClose(); }}
                            style={{
                                width: '100%', padding: '0.9rem',
                                background: 'linear-gradient(135deg, var(--accent-soft), var(--bronze-soft))',
                                border: '1px solid var(--accent-border)', borderRadius: '14px',
                                color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 600,
                                letterSpacing: '0.1em', cursor: 'pointer', marginTop: '2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <MapPin size={15} /> CERCA VICINO A ME
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
