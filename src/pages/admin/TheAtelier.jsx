import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit3, Trash2, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TheAtelier = () => {
    const [search, setSearch] = useState('');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    async function fetchStories() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setArticles(data);
            }
        } catch (e) {
            console.error("Errore recupero storie:", e);
        } finally {
            setLoading(false);
        }
    }

    const filteredArticles = articles.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Header / Azioni */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '350px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} color="#1A0406" />
                    <input
                        type="text"
                        placeholder="Cerca tra le storie..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#FFFFFF',
                            border: '1px solid rgba(0,0,0,0.1)',
                            padding: '1rem 1rem 1rem 3.5rem',
                            color: '#1A0406',
                            fontSize: '0.85rem',
                            borderRadius: '4px',
                            outline: 'none'
                        }}
                    />
                </div>
                <button style={{
                    backgroundColor: '#1A0406',
                    color: '#FDFDFB',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '2px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                }}>
                    <Plus size={18} /> SCRIVI STORIA
                </button>
            </div>

            {/* Articles List */}
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF', borderRadius: '4px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.4 }}>Caricamento storie in corso...</div>
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map((article, idx) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                padding: '2rem',
                                borderBottom: idx === filteredArticles.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.03)',
                                display: 'grid',
                                gridTemplateColumns: '3fr 1fr 1fr 1.5fr',
                                alignItems: 'center',
                                gap: '2rem'
                            }}
                        >
                            <div>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1A0406', marginBottom: '0.6rem' }}>{article.title}</h4>
                                <div style={{ display: 'flex', gap: '2rem', opacity: 0.5, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <User size={14} color="#A68966" /> {article.author || 'Redazione'}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={14} color="#A68966" /> {new Date(article.created_at).toLocaleDateString('it-IT')}
                                    </span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <span style={{
                                    fontSize: '0.6rem',
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '20px',
                                    backgroundColor: article.status === 'Live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(166, 137, 102, 0.1)',
                                    color: article.status === 'Live' ? '#10b981' : '#A68966',
                                    fontWeight: 800,
                                    textTransform: 'uppercase'
                                }}>
                                    {article.status || 'Bozza'}
                                </span>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1A0406' }}>{article.views || 0}</div>
                                <div style={{ fontSize: '0.55rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Letture</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem' }}>
                                <button title="Modifica" style={{ background: 'none', border: 'none', color: '#A68966', cursor: 'pointer' }}><Edit3 size={20} /></button>
                                <button title="Elimina" style={{ background: 'none', border: 'none', color: '#ff4444', opacity: 0.4, cursor: 'pointer' }}><Trash2 size={20} /></button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{ padding: '8rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#F8F8F5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#A68966' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#1A0406', marginBottom: '0.5rem' }}>Ancora nessuna storia nel tuo Atelier.</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Inizia a scrivere per ispirare i tuoi membri.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Citazione Ispirazionale */}
            <div style={{
                marginTop: '4rem',
                padding: '5rem',
                textAlign: 'center',
                border: '1px dashed rgba(0,0,0,0.1)',
                borderRadius: '8px'
            }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.4rem', opacity: 0.6, color: '#1A0406', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    "Ogni grande storia inizia con un'osservazione. Cosa hai notato oggi che merita di essere raccontato?"
                </p>
                <div style={{ marginTop: '2rem', width: '40px', height: '1px', background: '#A68966', margin: '2rem auto' }}></div>
            </div>

        </div>
    );
};

export default TheAtelier;
