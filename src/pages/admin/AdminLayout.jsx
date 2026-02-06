import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, MapPin, FileText, Users, Mail, BarChart3, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            setUser(session.user);
        };
        checkAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const menuItems = [
        { label: 'The Vault', icon: MapPin, path: '/admin' },
    ];

    const getPageTitle = () => {
        const item = menuItems.find(i => i.path === location.pathname);
        return item ? item.label : 'Intelligence';
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#FDFDFB', // Ivory Light Mode
            color: '#1A0406' // Dark Bordeaux Text
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                padding: '2.5rem 0',
                backgroundColor: '#F8F8F5'
            }}>
                <div style={{ padding: '0 2.5rem', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '0.9rem', letterSpacing: '0.4em', fontWeight: 900, marginBottom: '0.5rem', color: '#1A0406' }}>THE LIST</h1>
                    <div style={{ fontSize: '0.5rem', letterSpacing: '0.6em', color: '#A68966', opacity: 0.8 }}>NEWSROOM</div>
                </div>

                <nav style={{ flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1.2rem 2.5rem',
                                    textDecoration: 'none',
                                    color: isActive ? '#1A0406' : 'rgba(0,0,0,0.4)',
                                    backgroundColor: isActive ? 'rgba(0,0,0,0.03)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                <item.icon size={18} style={{ marginRight: '1.2rem' }} strokeWidth={isActive ? 2 : 1.5} color={isActive ? '#5D1219' : 'currentColor'} />
                                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: isActive ? 700 : 400 }}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        style={{ position: 'absolute', right: 0, width: '3px', height: '60%', backgroundColor: '#5D1219', borderRadius: '4px 0 0 4px' }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '0 2.5rem' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(0,0,0,0.4)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            padding: '1rem 0',
                            fontWeight: 500
                        }}
                    >
                        <LogOut size={16} style={{ marginRight: '0.8rem' }} />
                        Esci dallo Studio
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '4rem 5rem', overflowY: 'auto' }}>
                <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5, marginBottom: '1rem', color: '#5D1219', fontWeight: 700 }}>
                            {new Date().toLocaleDateString('it-IT', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                        </div>
                        <h2 className="serif" style={{ fontSize: '2.8rem', fontWeight: 300, color: '#1A0406' }}>
                            {location.pathname === '/admin' ? `Bentornato, Curator.` : getPageTitle()}
                        </h2>
                    </div>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A0406' }}>{user.email.split('@')[0]}</div>
                                <div style={{ fontSize: '0.55rem', color: '#A68966', letterSpacing: '0.15em', fontWeight: 600 }}>CAPO REDATTORE</div>
                            </div>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                backgroundColor: '#5D1219',
                                color: '#FDFDFB',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                boxShadow: '0 4px 10px rgba(93, 18, 25, 0.2)'
                            }}>
                                {user.email[0].toUpperCase()}
                            </div>
                        </div>
                    )}
                </header>

                <div style={{ maxWidth: '1200px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
