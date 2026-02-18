import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import PlaceDetails from './pages/PlaceDetails';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import NearbyPlaces from './pages/NearbyPlaces';
import FullMap from './pages/FullMap';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import TheVault from './pages/admin/TheVault';
import Intelligence from './pages/admin/Intelligence';
import TheAtelier from './pages/admin/TheAtelier';
import Team from './pages/admin/Team';

// Components
import BottomNav from './components/BottomNav';
import SearchOverlay from './components/SearchOverlay';
import PerfMonitor from './components/PerfMonitor';

const AdminWrapper = () => (
    <AdminLayout>
        <Outlet />
    </AdminLayout>
);

const AppContent = ({ session, isSearchOpen, setIsSearchOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const handleGlobalSearch = (query) => {
        // Navigate to /nearby with search query without reloading
        navigate(`/nearby?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="app-shell" style={{ background: 'transparent' }}>
            {/* Animated Background Blobs */}
            <div className="animated-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home session={session} />} />
                <Route path="/place/:id" element={<PlaceDetails session={session} />} />
                <Route path="/nearby" element={<NearbyPlaces />} />
                <Route path="/map" element={<FullMap />} />

                {/* User Profile / Saved */}
                <Route path="/saved" element={session ? <Saved session={session} /> : <Navigate to="/login" />} />
                <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" />} />

                {/* Auth */}
                <Route path="/login" element={!session ? <Auth /> : <Navigate to="/" />} />

                {/* Admin Routes - Managed Studio */}
                <Route path="/admin" element={<AdminWrapper />}>
                    <Route index element={<TheVault />} />
                    <Route path="team" element={<Team />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={handleGlobalSearch}
            />

            {!isAdminRoute && (
                <BottomNav
                    session={session}
                    isSearchOpen={isSearchOpen}
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onCloseSearch={() => setIsSearchOpen(false)}
                    onOpenAI={() => { console.log('AI Concierge opened'); }}
                />
            )}
        </div>
    );
};

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);


    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
            } catch (e) {
                console.error("Session check failed", e);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);



    if (loading) return (
        <div style={{
            background: 'var(--bg-primary)',
            height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'var(--text-primary)', flexDirection: 'column', gap: '0.6rem'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.8s ease forwards' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--accent)', lineHeight: 1 }}>THE</span>
                <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--bronze), transparent)', margin: '4px 0', animation: 'fadeIn 1s ease 0.4s forwards', opacity: 0 }} />
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-primary)', lineHeight: 1 }}>LIST</span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'linear-gradient(to bottom, transparent, var(--bronze-soft), transparent)', animation: 'fadeIn 1.2s ease 0.6s forwards', opacity: 0 }} />
            <div style={{
                fontFamily: 'Playfair Display, serif', letterSpacing: '0.3em', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic',
                animation: 'fadeIn 1.5s ease 0.8s forwards', opacity: 0
            }}>
                selected.
            </div>
        </div>
    );

    return (
        <ThemeProvider>
            <Router>
                <AppContent
                    session={session}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                />
            </Router>
        </ThemeProvider>
    );
}

export default App;
