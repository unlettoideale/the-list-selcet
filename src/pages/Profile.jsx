import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, LogOut, Check, Edit3, X, ChevronRight } from 'lucide-react';

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

    const formatDate = (d) => {
        if (!d) return '—';
        try { return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; }
    };

    if (loading) return (
        <div style={{ background: '#F7F2EE', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ color: '#9B3A4A', letterSpacing: '0.3em', fontSize: '0.7rem', fontFamily: 'var(--font-serif)' }}>THE LIST</motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F7F2EE', color: '#1A1A1A', paddingBottom: '120px' }}>
            {/* Header */}
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                style={{ padding: '2rem 1.5rem 0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600, margin: 0, color: '#8A8478' }}>Profilo</h1>
                    {!editing ? (
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(true)}
                            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '20px', padding: '0.4rem 0.9rem', color: '#9B3A4A', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                            <Edit3 size={11} /> MODIFICA
                        </motion.button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel}
                                style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '20px', padding: '0.4rem 0.7rem', color: '#1A1A1A', fontSize: '0.55rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <X size={11} /> ANNULLA
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                                style={{ background: 'linear-gradient(135deg, #9B3A4A, #B85467)', border: 'none', borderRadius: '20px', padding: '0.4rem 0.9rem', color: '#fff', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 3px 12px rgba(155,58,74,0.2)' }}>
                                <Check size={11} /> {saving ? 'SALVO...' : 'SALVA'}
                            </motion.button>
                        </div>
                    )}
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
                        background: 'linear-gradient(135deg, #9B3A4A, #C4956A)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(155,58,74,0.2)'
                    }}>
                        <span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400 }}>
                            {(profile?.first_name?.[0] || 'M').toUpperCase()}
                        </span>
                    </div>
                    <h2 className="serif" style={{ fontSize: '1.6rem', fontWeight: 400, margin: '0 0 0.2rem' }}>
                        {profile?.first_name || 'Membro'} {profile?.last_name || ''}
                    </h2>
                    <p style={{ fontSize: '0.6rem', color: '#8A8478', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {isAdmin ? '🛡️ Amministratore' : '✦ Selected Member'}
                    </p>
                </motion.section>

                {/* Admin Button */}
                {isAdmin && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '1rem' }}>
                        <Link to="/admin" style={{ textDecoration: 'none' }}>
                            <div style={{
                                background: '#FFFFFF', border: '1px solid rgba(196,149,106,0.2)',
                                borderRadius: '14px', padding: '0.9rem 1.1rem',
                                display: 'flex', alignItems: 'center', gap: '0.7rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.3s ease'
                            }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #C4956A, #D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(196,149,106,0.25)' }}>
                                    <Shield size={17} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A' }}>Pannello Admin</p>
                                    <p style={{ margin: 0, fontSize: '0.5rem', color: '#8A8478' }}>Gestisci luoghi e team</p>
                                </div>
                                <ChevronRight size={16} style={{ color: '#B5AEA5' }} />
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Fields Card */}
                <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                    <div style={{
                        background: '#FFFFFF', borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                    }}>
                        <ProfileField icon={<User size={16} />} label="Nome" value={formData.first_name} editing={editing} onChange={v => setFormData(p => ({ ...p, first_name: v }))} placeholder="Il tuo nome" />
                        <Divider />
                        <ProfileField icon={<User size={16} />} label="Cognome" value={formData.last_name} editing={editing} onChange={v => setFormData(p => ({ ...p, last_name: v }))} placeholder="Il tuo cognome" />
                        <Divider />
                        <div style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(155,58,74,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mail size={15} style={{ color: '#9B3A4A' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.45rem', color: '#B5AEA5', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
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
                        background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)',
                        padding: '1.1rem', display: 'flex', gap: '1rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.45rem', color: '#B5AEA5', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Status</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9B3A4A', fontWeight: 600, letterSpacing: '0.06em' }}>SELECT VERIFIED ✦</p>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(0,0,0,0.05)' }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.45rem', color: '#B5AEA5', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Membro dal</p>
                            <p style={{ margin: 0, fontSize: '0.75rem' }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : '—'}</p>
                        </div>
                    </div>
                </motion.section>

                {/* Sign Out */}
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: '1.5rem' }}>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleLogout}
                        style={{ width: '100%', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '0.9rem', color: '#1A1A1A', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.03)' }}>
                        <LogOut size={14} style={{ color: '#B5AEA5' }} /> Esci dall'account
                    </motion.button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.42rem', color: '#B5AEA5', letterSpacing: '0.15em', textTransform: 'uppercase' }}>The List Select © 2026</p>
                </motion.section>
            </main>
        </div>
    );
};

const ProfileField = ({ icon, label, value, displayValue, editing, onChange, placeholder, type = 'text' }) => (
    <div style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(155,58,74,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#9B3A4A' }}>{icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.45rem', color: '#B5AEA5', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</p>
            {editing ? (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(155,58,74,0.2)', padding: '0.25rem 0', color: '#1A1A1A', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.3s ease' }} />
            ) : (
                <p style={{ margin: 0, fontSize: '0.8rem', color: value ? '#1A1A1A' : '#B5AEA5' }}>{displayValue || value || placeholder || '—'}</p>
            )}
        </div>
    </div>
);

const Divider = () => <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0 1.1rem' }} />;

export default Profile;
