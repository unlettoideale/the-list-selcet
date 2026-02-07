import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Shield, ShieldAlert, ShieldCheck, Mail, Trash2, Key, X, Check, Lock, Eye, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Team = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State for Adding Staff
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        role: 'EDITOR',
        permissions: {
            places: true,
            articles: true,
            stats: false,
            team: false
        }
    });

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            console.log("Fetching community members...");
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Database Error:", error);
                // Forniamo un feedback dettagliato all'utente
                alert(`Errore Database: ${error.message}\n\nCodice: ${error.code}\nVerifica se la tabella 'profiles' esiste in Supabase.`);
                throw error;
            }

            console.log("Members found:", data?.length || 0);
            setMembers(data || []);
        } catch (err) {
            console.error("Fetch team error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePermissionToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('profiles')
                .insert([{
                    ...formData,
                    role: formData.role.toUpperCase()
                }]);

            if (error) throw error;
            setIsAddOpen(false);
            fetchTeam();
        } catch (err) {
            alert(err.message);
        }
    };

    const sendResetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/login',
            });
            if (error) throw error;
            alert("Richiesta inviata! L'utente riceverà una mail per il reset.\n\nNOTA: Se non la vede, chiedigli di controllare nella cartella SPAM.");
        } catch (err) {
            alert("Errore reset password: " + err.message);
        }
    };

    const handleDeleteMember = async (memberId, memberEmail) => {
        if (!window.confirm(`Sei sicuro di voler rimuovere l'utente ${memberEmail} dalla community? questa azione è irreversibile.`)) return;

        try {
            // Nota: L'eliminazione da auth.users richiede permessi service_role.
            // Qui eliminiamo il profilo. Se c'è un trigger on delete, potrebbe gestire il resto.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            alert("Utente rimosso con successo dal database profili.");
            fetchTeam();
        } catch (err) {
            alert("Errore durante l'eliminazione: " + err.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Community Stats & Search */}
            <div style={{
                background: '#FFFFFF',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="serif" style={{ fontSize: '1.8rem', color: '#1A0406', marginBottom: '0.5rem' }}>Social Community</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                <span style={{ opacity: 0.4 }}>COMMUNITY TOTALE:</span>
                                <span style={{ color: '#5D1219', marginLeft: '0.4rem' }}>{members.length} UTENTI</span>
                            </div>
                            <div style={{ width: '1px', height: '10px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                            <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                <span style={{ opacity: 0.4 }}>OGGI:</span>
                                <span style={{ color: '#A68966', marginLeft: '0.4rem' }}>+{Math.floor(members.length * 0.05)} NUOVI</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        style={{
                            background: '#1A0406',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em'
                        }}
                    >
                        <Plus size={16} /> AGGIUNGI STAFF
                    </button>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input
                        type="text"
                        placeholder="Cerca utente per email, nome o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            backgroundColor: '#F8F8F5'
                        }}
                    />
                </div>
            </div>

            {/* Social User Database */}
            <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                overflowX: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}>
                <div style={{
                    minWidth: '900px', // Garantisce che il layout non collassi troppo
                    display: 'grid',
                    gridTemplateColumns: '80px 1.5fr 1.5fr 1.2fr 1fr 100px',
                    padding: '1.2rem 2rem',
                    background: '#F8F8F5',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontWeight: 800,
                    opacity: 0.4
                }}>
                    <div>Avatar</div>
                    <div>Identità Personale</div>
                    <div>Contatto Email</div>
                    <div>Ruolo / Grado</div>
                    <div>Data Unione</div>
                    <div style={{ textAlign: 'right' }}>Gestione</div>
                </div>

                <div style={{ minWidth: '900px', display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                        <div style={{ padding: '8rem', textAlign: 'center', opacity: 0.3 }}>Scansione della community in corso...</div>
                    ) : filteredMembers.map((member) => (
                        <div
                            key={member.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1.5fr 1.5fr 1.2fr 1fr 100px',
                                padding: '1.2rem 2rem',
                                borderBottom: '1px solid rgba(0,0,0,0.03)',
                                alignItems: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {/* Avatar */}
                            <div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: member.role === 'ADMIN' ? '#5D1219' : (member.role === 'EDITOR' ? '#1A0406' : '#F0F0EE'),
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: member.role === 'MEMBER' ? '#1A0406' : 'white',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}>
                                    {member.first_name?.[0] || member.email?.[0].toUpperCase()}
                                </div>
                            </div>

                            {/* Identity */}
                            <div style={{ paddingRight: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1A0406', marginBottom: '0.2rem' }}>
                                    {member.first_name || 'Curatore'} {member.last_name || 'Select'}
                                </h4>
                                <div style={{ fontSize: '0.65rem', opacity: 0.3, letterSpacing: '0.05em' }}>ID: {member.id?.toUpperCase().slice(0, 8)}...</div>
                            </div>

                            {/* Email */}
                            <div style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
                                {member.email}
                            </div>

                            {/* Role */}
                            <div>
                                <span style={{
                                    fontSize: '0.55rem',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '100px',
                                    backgroundColor: member.role === 'ADMIN' ? 'rgba(93,18,25,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: member.role === 'ADMIN' ? '#5D1219' : '#1A0406',
                                    fontWeight: 800,
                                    letterSpacing: '0.05em'
                                }}>
                                    {member.role === 'MEMBER' || !member.role ? 'STANDARD' : (member.role === 'ADMIN' ? 'ADMIN' : 'EDITOR')}
                                </span>
                            </div>

                            {/* Date */}
                            <div style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 500 }}>
                                {member.created_at ? new Date(member.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '---'}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => sendResetPassword(member.email)}
                                    title="Dati Account / Reset Password"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Key size={18} color="#A68966" />
                                </button>
                                <button
                                    onClick={() => handleDeleteMember(member.id, member.email)}
                                    title="Modera / Elimina Profilo"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Trash2 size={18} color="#ff4444" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL AGGIUNGI STAFF */}
            <AnimatePresence>
                {isAddOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26, 4, 6, 0.9)', backdropFilter: 'blur(20px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: '#FDFDFB', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '3.5rem', boxShadow: '0 50px 100px rgba(0,0,0,0.6)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                <h3 className="serif" style={{ fontSize: '2rem' }}>Privilegi Staff</h3>
                                <button onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}><X size={32} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: '0.8rem', fontWeight: 700 }}>Email Profilo</label>
                                    <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', fontSize: '1rem', background: '#F8F8F5' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                    <input placeholder="Nome" required type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} style={{ width: '100%', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: '#F8F8F5' }} />
                                    <input placeholder="Cognome" required type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} style={{ width: '100%', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: '#F8F8F5' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: '0.8rem', fontWeight: 700 }}>Ruolo Studio</label>
                                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', appearance: 'none', cursor: 'pointer', background: '#F8F8F5' }}>
                                        <option value="EDITOR">EDITOR (Contributor)</option>
                                        <option value="ADMIN">ADMIN (Full Control)</option>
                                    </select>
                                </div>
                                <button type="submit" style={{ marginTop: '1.5rem', width: '100%', backgroundColor: '#1A0406', color: 'white', border: 'none', padding: '1.4rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em' }}>NOMINA NUOVO STAFF</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Team;
