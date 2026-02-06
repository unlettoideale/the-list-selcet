import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, Bookmark, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ session, isSearchOpen, onOpenSearch, onCloseSearch }) => {
    const location = useLocation();

    // 0: Home, 1: Search, 2: Saved, 3: Account
    const getActiveTab = () => {
        if (isSearchOpen) return 1;
        if (location.pathname === '/') return 0;
        if (location.pathname === '/saved') return 2;
        if (location.pathname === '/profile' || location.pathname === '/login') return 3;
        return 0;
    };

    const activeIdx = getActiveTab();

    const tabs = [
        { id: 'home', to: '/', icon: HomeIcon },
        { id: 'search', to: '#', icon: Search, isButton: true },
        { id: 'saved', to: '/saved', icon: Bookmark },
        { id: 'account', to: session ? "/profile" : "/login", icon: User }
    ];

    return (
        <nav className="bottom-nav">
            {/* The Animated Bubble */}
            <motion.div
                className="nav-active-bg"
                animate={{
                    x: `calc(${activeIdx * (100 / tabs.length)}vw + ${(100 / tabs.length) / 2}vw - 22.5px)`,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
                style={{
                    left: 0,
                    top: '-15px',
                    position: 'absolute'
                }}
            />

            {tabs.map((tab, idx) => {
                const active = activeIdx === idx;
                const Icon = tab.icon;

                const content = (
                    <motion.div
                        animate={{
                            y: active ? -28 : 0,
                            scale: active ? 1.1 : 1
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2,
                            color: active ? 'var(--bordeaux-main)' : 'var(--grey-warm)',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon size={22} strokeWidth={active ? 2.5 : 1.2} />
                    </motion.div>
                );

                if (tab.isButton) {
                    return (
                        <button
                            key={tab.id}
                            className="nav-item"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-warm)', flex: 1, height: '100%' }}
                            onClick={() => {
                                if (isSearchOpen) {
                                    onCloseSearch();
                                } else {
                                    onOpenSearch();
                                }
                            }}
                        >
                            {content}
                        </button>
                    );
                }

                return (
                    <Link
                        key={tab.id}
                        to={tab.to}
                        className="nav-item"
                        style={{ flex: 1, height: '100%' }}
                        onClick={() => {
                            if (isSearchOpen && onCloseSearch) onCloseSearch();
                        }}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
