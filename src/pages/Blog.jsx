import { motion } from 'framer-motion';

const Blog = () => {
    const articles = [
        {
            id: 1,
            title: "L'Arte del Cocktails a Milano",
            excerpt: "Un viaggio attraverso i banconi più esclusivi della città, dove il drink è un'opera d'arte.",
            date: "FEB 2026",
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000"
        },
        {
            id: 2,
            title: "Hotel o Dimore Storiche?",
            excerpt: "Perché la scelta del pernottamento definisce l'intera esperienza di viaggio.",
            date: "JAN 2026",
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000"
        }
    ];

    return (
        <div style={{ backgroundColor: 'var(--deep-bordeaux)', minHeight: '100vh', color: 'var(--ivory)' }}>
            <header className="container" style={{ padding: '8rem 0 4rem 0' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.4em', opacity: 0.4 }}>THE SELECT JOURNAL</span>
                <h1 className="serif" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', margin: '1rem 0' }}>Editorial.</h1>
            </header>

            <div className="container" style={{ display: 'grid', gap: '8rem', paddingBottom: '10rem' }}>
                {articles.map((article, index) => (
                    <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr',
                            gap: '4rem',
                            alignItems: 'center'
                        }}
                    >
                        {index % 2 === 0 ? (
                            <>
                                <div style={{ aspectRatio: '4/5', overflow: 'hidden', border: '1px solid var(--border-ivory)' }}>
                                    <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', opacity: 0.4 }}>{article.date}</span>
                                    <h2 className="serif" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{article.title}</h2>
                                    <p style={{ opacity: 0.6, lineHeight: 1.8, marginBottom: '2rem' }}>{article.excerpt}</p>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--ivory)',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--ivory)',
                                        paddingBottom: '5px',
                                        cursor: 'pointer'
                                    }}>
                                        Read Article
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', opacity: 0.4 }}>{article.date}</span>
                                    <h2 className="serif" style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{article.title}</h2>
                                    <p style={{ opacity: 0.6, lineHeight: 1.8, marginBottom: '2rem' }}>{article.excerpt}</p>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--ivory)',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--ivory)',
                                        paddingBottom: '5px',
                                        cursor: 'pointer'
                                    }}>
                                        Read Article
                                    </button>
                                </div>
                                <div style={{ aspectRatio: '4/5', overflow: 'hidden', border: '1px solid var(--border-ivory)' }}>
                                    <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                </div>
                            </>
                        )}
                    </motion.article>
                ))}
            </div>
        </div>
    );
};

export default Blog;
