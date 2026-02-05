import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Plus, Trash2, LogOut } from 'lucide-react';

const Admin = () => {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Restaurant',
        city: '',
        neighborhood: '',
        hero_image: '',
        description: '',
        maps_url: '',
        website_url: '',
        phone: ''
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    useEffect(() => {
        if (session) fetchPlaces();
    }, [session]);

    async function fetchPlaces() {
        const { data } = await supabase.from('places').select('*').order('created_at', { ascending: false });
        setPlaces(data || []);
    }

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(error.message);
        setLoading(false);
    }

    async function handleAddPlace(e) {
        e.preventDefault();
        const { error } = await supabase.from('places').insert([formData]);
        if (error) alert(error.message);
        else {
            setFormData({ name: '', category: 'Restaurant', city: '', neighborhood: '', hero_image: '', description: '', maps_url: '', website_url: '', phone: '' });
            fetchPlaces();
        }
    }

    async function toggleStatus(id, currentStatus) {
        const newStatus = currentStatus === 'ACTIVE' ? 'REMOVED' : 'ACTIVE';
        await supabase.from('places').update({ status: newStatus }).eq('id', id);
        fetchPlaces();
    }

    if (!session) {
        return (
            <div className="container fade-in" style={{ padding: '8rem 1.5rem', maxWidth: '400px' }}>
                <h1 className="serif" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>Admin Access</h1>
                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '1rem' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '1rem' }}
                    />
                    <button className="luxury-button" type="submit" disabled={loading}>
                        {loading ? 'Entrata...' : 'Entra'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3rem 0' }}>
                <h1 className="serif" style={{ fontSize: '2.5rem' }}>Dashboard</h1>
                <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: '#F5F5F0', cursor: 'pointer', opacity: 0.5 }}>
                    <LogOut size={20} />
                </button>
            </div>

            {/* Form Aggiunta */}
            <section style={{ background: '#0D0D0D', padding: '2rem', border: '1px solid #1A1A1A', marginBottom: '4rem' }}>
                <h2 className="serif" style={{ marginBottom: '2rem' }}>Aggiungi Posto</h2>
                <form onSubmit={handleAddPlace} style={{ display: 'grid', gap: '1.2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                        <input placeholder="Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }} required />
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }}>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Hotel">Hotel</option>
                            <option value="Bar">Bar</option>
                            <option value="Experience">Experience</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                        <input placeholder="Città" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }} required />
                        <input placeholder="Quartiere" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }} />
                    </div>
                    <input placeholder="URL Immagine Hero" value={formData.hero_image} onChange={e => setFormData({ ...formData, hero_image: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }} />
                    <textarea placeholder="Micro-descrizione editoriale" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem', minHeight: '100px' }} />
                    <input placeholder="Google Maps URL" value={formData.maps_url} onChange={e => setFormData({ ...formData, maps_url: e.target.value })} style={{ background: '#1A1A1A', border: '1px solid #333', color: 'white', padding: '0.8rem' }} />
                    <button className="luxury-button" type="submit" style={{ marginTop: '1rem' }}>
                        <Plus size={18} /> Aggiungi alla Lista
                    </button>
                </form>
            </section>

            {/* Lista Esistente */}
            <section>
                <h2 className="serif" style={{ marginBottom: '2rem' }}>Gestisci Posti</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {places.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{p.name}</h3>
                                <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>{p.city} — {p.category}</p>
                            </div>
                            <button
                                onClick={() => toggleStatus(p.id, p.status)}
                                style={{
                                    background: p.status === 'ACTIVE' ? 'transparent' : 'var(--dark-bordeaux)',
                                    border: '1px solid #333',
                                    padding: '0.5rem 1rem',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {p.status === 'ACTIVE' ? 'DISATTIVA' : 'RIATTIVA'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Admin;
