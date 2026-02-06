import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    if (!error) setProfile(data);
                }
            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (loading) return (
        <div style={{ backgroundColor: 'var(--bordeaux-main)', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="serif" style={{ color: 'var(--ivory)', letterSpacing: '0.4em', fontSize: '1rem' }}>THE LIST</span>
            </motion.div>
        </div>
    );

    return (
        <div className="app-shell" style={{ background: 'transparent', color: 'var(--ivory)', paddingBottom: '10rem' }}>
            <header style={{ padding: '6rem 2rem 5rem', textAlign: 'center' }}>
                <h1 className="logo-main" style={{ fontSize: '1.2rem', letterSpacing: '0.4em' }}>Account</h1>
            </header>

            <main className="luxury-container" style={{ padding: '0 1.5rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <section style={{ marginBottom: '6rem', textAlign: 'center' }}>
                        <div className="selected-badge" style={{ margin: '0 auto 2rem' }}>Selected Member</div>
                        <h2 className="serif" style={{ fontSize: '2.5rem', fontWeight: 200, marginBottom: '0.8rem' }}>
                            {profile?.first_name || 'Member'} {profile?.last_name || ''}
                        </h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--grey-warm)', letterSpacing: '0.05em' }}>{user?.email}</p>
                    </section>

                    <section style={{ borderTop: '0.5px solid var(--border)', paddingTop: '4rem' }}>
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            <div style={{ opacity: 0.8 }}>
                                <span style={{ display: 'block', fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--grey-warm)', marginBottom: '0.8rem' }}>Membership Status</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--bordeaux-accent)', fontWeight: 600, letterSpacing: '0.1em' }}>SELECT VERIFIED</span>
                            </div>

                            <div style={{ opacity: 0.8 }}>
                                <span style={{ display: 'block', fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--grey-warm)', marginBottom: '0.8rem' }}>Member Since</span>
                                <span style={{ fontSize: '0.9rem' }}>{new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '8rem' }}>
                            <button
                                onClick={handleLogout}
                                className="luxury-button"
                                style={{ border: '0.5px solid var(--border)', color: 'var(--ivory)', background: 'transparent' }}
                            >
                                Sign Out
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.5rem', opacity: 0.2, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                The List Select © 2026
                            </p>
                        </div>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default Profile;
