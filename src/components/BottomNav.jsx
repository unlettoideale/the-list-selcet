import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, Bookmark, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav = ({ session, isSearchOpen, onOpenSearch, onCloseSearch, onOpenAI }) => {
    const location = useLocation();

    const getActiveTab = () => {
        if (isSearchOpen) return 'search';
        if (location.pathname === '/') return 'home';
        if (location.pathname === '/saved') return 'saved';
        if (location.pathname === '/profile' || location.pathname === '/login') return 'account';
        return 'home';
    };

    const activeTab = getActiveTab();

    return (
        <nav className="bottom-nav">
            {/* Home */}
            <Link
                to="/"
                className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => { if (isSearchOpen && onCloseSearch) onCloseSearch(); }}
            >
                <motion.div
                    animate={{ y: activeTab === 'home' ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                >
                    <HomeIcon size={20} strokeWidth={activeTab === 'home' ? 2 : 1.4} color={activeTab === 'home' ? 'var(--accent)' : 'var(--nav-inactive)'} />
                    <span className="nav-item-label" style={{ color: activeTab === 'home' ? 'var(--accent)' : 'var(--nav-inactive)' }}>Home</span>
                </motion.div>
                <AnimatePresence>
                    {activeTab === 'home' && (
                        <motion.div
                            className="nav-item-dot"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </Link>

            {/* Search */}
            <button
                className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
                onClick={() => isSearchOpen ? onCloseSearch() : onOpenSearch()}
            >
                <motion.div
                    animate={{ y: activeTab === 'search' ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                >
                    <Search size={20} strokeWidth={activeTab === 'search' ? 2 : 1.4} color={activeTab === 'search' ? 'var(--accent)' : 'var(--nav-inactive)'} />
                    <span className="nav-item-label" style={{ color: activeTab === 'search' ? 'var(--accent)' : 'var(--nav-inactive)' }}>Cerca</span>
                </motion.div>
                <AnimatePresence>
                    {activeTab === 'search' && (
                        <motion.div
                            className="nav-item-dot"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </button>

            {/* AI Concierge — Center */}
            <div className="ai-center-wrap" onClick={onOpenAI}>
                <motion.button
                    className="ai-center-btn"
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.05 }}
                >
                    <Sparkles size={24} strokeWidth={1.8} />
                </motion.button>
                <span className="ai-center-label">Concierge</span>
            </div>

            {/* Saved */}
            <Link
                to="/saved"
                className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => { if (isSearchOpen && onCloseSearch) onCloseSearch(); }}
            >
                <motion.div
                    animate={{ y: activeTab === 'saved' ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                >
                    <Bookmark size={20} strokeWidth={activeTab === 'saved' ? 2 : 1.4} color={activeTab === 'saved' ? 'var(--accent)' : 'var(--nav-inactive)'} />
                    <span className="nav-item-label" style={{ color: activeTab === 'saved' ? 'var(--accent)' : 'var(--nav-inactive)' }}>Salvati</span>
                </motion.div>
                <AnimatePresence>
                    {activeTab === 'saved' && (
                        <motion.div
                            className="nav-item-dot"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </Link>

            {/* Profile */}
            <Link
                to={session ? "/profile" : "/login"}
                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => { if (isSearchOpen && onCloseSearch) onCloseSearch(); }}
            >
                <motion.div
                    animate={{ y: activeTab === 'account' ? -2 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
                >
                    <User size={20} strokeWidth={activeTab === 'account' ? 2 : 1.4} color={activeTab === 'account' ? 'var(--accent)' : 'var(--nav-inactive)'} />
                    <span className="nav-item-label" style={{ color: activeTab === 'account' ? 'var(--accent)' : 'var(--nav-inactive)' }}>Profilo</span>
                </motion.div>
                <AnimatePresence>
                    {activeTab === 'account' && (
                        <motion.div
                            className="nav-item-dot"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </Link>
        </nav>
    );
};

export default BottomNav;
