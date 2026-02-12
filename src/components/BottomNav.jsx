import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Search, Bookmark, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav = ({ session, isSearchOpen, onOpenSearch, onCloseSearch }) => {
    const location = useLocation();

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
            <motion.div
                className="nav-active-bg"
                animate={{ x: `calc(${activeIdx * (100 / tabs.length)}vw + ${(100 / tabs.length) / 2}vw - 22px)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ left: 0, top: '-14px', position: 'absolute' }}
            />

            {tabs.map((tab, idx) => {
                const active = activeIdx === idx;
                const Icon = tab.icon;

                const content = (
                    <motion.div
                        animate={{ y: active ? -26 : 0, scale: active ? 1.05 : 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            zIndex: 2, color: active ? '#FFFFFF' : '#B5AEA5',
                            width: '100%', height: '100%', justifyContent: 'center'
                        }}
                    >
                        <Icon size={20} strokeWidth={active ? 2.2 : 1.3} />
                    </motion.div>
                );

                if (tab.isButton) {
                    return (
                        <button key={tab.id} className="nav-item"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B5AEA5', flex: 1, height: '100%' }}
                            onClick={() => isSearchOpen ? onCloseSearch() : onOpenSearch()}>
                            {content}
                        </button>
                    );
                }

                return (
                    <Link key={tab.id} to={tab.to} className="nav-item"
                        style={{ flex: 1, height: '100%' }}
                        onClick={() => { if (isSearchOpen && onCloseSearch) onCloseSearch(); }}>
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;
