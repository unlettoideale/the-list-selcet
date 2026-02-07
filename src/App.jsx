import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import PlaceDetails from './pages/PlaceDetails';
import Profile from './pages/Profile';
import Saved from './pages/Saved';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import TheVault from './pages/admin/TheVault';
import Intelligence from './pages/admin/Intelligence';
import TheAtelier from './pages/admin/TheAtelier';
import Team from './pages/admin/Team';

// Components
import BottomNav from './components/BottomNav';
import SearchOverlay from './components/SearchOverlay';

const AdminWrapper = () => (
    <AdminLayout>
        <Outlet />
    </AdminLayout>
);

const AppContent = ({ session, searchQuery, isSearchOpen, setIsSearchOpen, handleGlobalSearch }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="app-shell" style={{ background: 'transparent' }}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home session={session} externalQuery={searchQuery} />} />
                <Route path="/place/:id" element={<PlaceDetails session={session} />} />

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
                />
            )}
        </div>
    );
};

function App() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleGlobalSearch = (query) => {
        setSearchQuery(query);
    };

    if (loading) return (
        <div style={{ background: '#2D080C', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FDFDFB' }}>
            <div style={{ fontFamily: 'serif', letterSpacing: '0.4em', fontSize: '1.2rem', opacity: 0.8 }}>
                THE LIST
            </div>
        </div>
    );

    return (
        <Router>
            <AppContent
                session={session}
                searchQuery={searchQuery}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
                handleGlobalSearch={handleGlobalSearch}
            />
        </Router>
    );
}

export default App;
