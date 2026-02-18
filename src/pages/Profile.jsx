import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, LogOut, Check, Edit3, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', birthday: '' });

    useEffect(() => { fetchUserData(); }, []);

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (!error && data) {
                    setProfile(data);
                    setFormData({ first_name: data.first_name || '', last_name: data.last_name || '', phone: data.phone || '', birthday: data.birthday || '' });
                }
            }
        } catch (err) { console.error("Profile load error:", err); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').update({ first_name: formData.first_name, last_name: formData.last_name, phone: formData.phone, birthday: formData.birthday }).eq('id', user.id);
            if (error) throw error;
            setProfile(prev => ({ ...prev, ...formData }));
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) { console.error("Save error:", err); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        setFormData({ first_name: profile?.first_name || '', last_name: profile?.last_name || '', phone: profile?.phone || '', birthday: profile?.birthday || '' });
        setEditing(false);
    };

    const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };
    const isAdmin = profile?.role?.toUpperCase() === 'ADMIN';
    const { theme, toggleTheme } = useTheme();

    const formatDate = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: 'var(--accent)', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '120px', position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                style={{ padding: '2rem 1.5rem 0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, margin: 0, color: 'var(--text-muted)' }}>Profilo</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Theme Toggle */}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={toggleTheme}
                            style={{ background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }}>
                            {theme === 'dark' ? <Sun size={16} color="var(--accent)" /> : <Moon size={16} color="var(--accent)" />}
                        </motion.button>
                        {!editing ? (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(true)}
                                style={{ background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', borderRadius: '20px', padding: '0.4rem 0.9rem', color: 'var(--accent)', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', backdropFilter: 'blur(8px)' }}>
                                <Edit3 size={11} /> MODIFICA
                            </motion.button>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel}
                                    style={{ background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', borderRadius: '20px', padding: '0.4rem 0.7rem', color: 'var(--text-primary)', fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <X size={11} /> ANNULLA
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                                    style={{ background: 'linear-gradient(135deg, var(--accent), #B88840)', border: 'none', borderRadius: '20px', padding: '0.4rem 0.9rem', color: '#1C000A', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 3px 12px rgba(212,168,106,0.3)' }}>
                                    <Check size={11} /> {saving ? 'SALVO...' : 'SALVA'}
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.header>

            {/* Toast */}
            <AnimatePresence>
                {saved && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: '#2d7a3e', padding: '0.5rem 1.2rem', borderRadius: '20px', zIndex: 5000, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <Check size={13} /> Salvato
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ padding: '0 1.5rem', maxWidth: '450px', margin: '0 auto' }}>
                {/* Avatar */}
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, var(--accent), #B88840)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(212,168,106,0.3)'
                    }}>
                        <span style={{ color: '#FFFFFF', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>
                            {(profile?.first_name?.[0] || 'M').toUpperCase()}
                        </span>
                    </div>
                    <h2 className="serif" style={{ fontSize: '1.6rem', fontWeight: 400, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                        {profile?.first_name || 'Membro'} {profile?.last_name || ''}
                    </h2>
                    <p style={{ fontSize: '0.6rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {isAdmin ? '🛡️ Amministratore' : '✦ Selected Member'}
                    </p>
                </motion.section>

                {/* Admin Button */}
                {isAdmin && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '1rem' }}>
                        <Link to="/admin" style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                                borderRadius: '14px', padding: '0.9rem 1.1rem',
                                display: 'flex', alignItems: 'center', gap: '0.7rem',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s ease'
                            }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent), #B88840)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(212,168,106,0.25)' }}>
                                    <Shield size={17} color="#1C000A" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--card-text)' }}>Pannello Admin</p>
                                    <p style={{ margin: 0, fontSize: '0.5rem', color: 'var(--card-text-secondary)' }}>Gestisci luoghi e team</p>
                                </div>
                                <ChevronRight size={16} style={{ color: 'var(--card-text-muted)' }} />
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Fields Card */}
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                    <div style={{
                        background: 'var(--card-bg)', borderRadius: '16px',
                        border: '1px solid var(--card-border)', overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <ProfileField icon={<User size={16} />} label="Nome" value={formData.first_name} editing={editing} onChange={v => setFormData(p => ({ ...p, first_name: v }))} placeholder="Il tuo nome" />
                        <Divider />
                        <ProfileField icon={<User size={16} />} label="Cognome" value={formData.last_name} editing={editing} onChange={v => setFormData(p => ({ ...p, last_name: v }))} placeholder="Il tuo cognome" />
                        <Divider />
                        <div style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mail size={15} style={{ color: 'var(--accent)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.45rem', color: 'var(--card-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--card-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                            </div>
                        </div>
                        <Divider />
                        <ProfileField icon={<Phone size={16} />} label="Telefono" value={formData.phone} editing={editing} onChange={v => setFormData(p => ({ ...p, phone: v }))} placeholder="+39 123 456 7890" type="tel" />
                        <Divider />
                        <ProfileField icon={<Calendar size={16} />} label="Data di nascita" value={formData.birthday} displayValue={formatDate(formData.birthday)} editing={editing} onChange={v => setFormData(p => ({ ...p, birthday: v }))} type="date" />
                    </div>
                </motion.section>

                {/* Status */}
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '1rem' }}>
                    <div style={{
                        background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)',
                        padding: '1.1rem', display: 'flex', gap: '1rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.45rem', color: 'var(--card-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em' }}>SELECT VERIFIED ✦</p>
                        </div>
                        <div style={{ width: '1px', background: 'var(--card-border)' }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.45rem', color: 'var(--card-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Membro dal</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--card-text)' }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : '—'}</p>
                        </div>
                    </div>
                </motion.section>

                {/* Sign Out */}
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: '1.5rem' }}>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout}
                        style={{ width: '100%', background: 'var(--btn-bg)', border: '1px solid var(--btn-border)', borderRadius: '14px', padding: '0.9rem', color: 'var(--text-primary)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backdropFilter: 'blur(8px)' }}>
                        <LogOut size={14} style={{ color: 'var(--text-muted)' }} /> Esci dall'account
                    </motion.button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.42rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>The List Select © 2026</p>
                </motion.section>
            </main>
        </div>
    );
};

const ProfileField = ({ icon, label, value, displayValue, editing, onChange, placeholder, type = 'text' }) => (
    <div style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212,168,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'var(--accent)' }}>{icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.45rem', color: 'var(--card-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</p>
            {editing ? (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(212,168,106,0.3)', padding: '0.25rem 0', color: 'var(--card-text)', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.3s ease' }} />
            ) : (
                <p style={{ margin: 0, fontSize: '0.8rem', color: value ? 'var(--card-text)' : 'var(--card-text-muted)' }}>{displayValue || value || placeholder || '—'}</p>
            )}
        </div>
    </div>
);

const Divider = () => <div style={{ height: '1px', background: 'var(--card-border)', margin: '0 1.1rem' }} />;

export default Profile;
