const Blog = () => {
    const articles = [
        {
            id: 1,
            title: "L'Arte del Cocktails a Milano",
            excerpt: "Un viaggio attraverso i banconi più esclusivi della città, dove il drink è un'opera d'arte.",
            date: "Febbraio 2026"
        },
        {
            id: 2,
            title: "Hotel o Dimore Storiche?",
            excerpt: "Perché la scelta del pernottamento definisce l'intera esperienza di viaggio.",
            date: "Gennaio 2026"
        }
    ];

    return (
        <div className="container fade-in" style={{ paddingBottom: '5rem' }}>
            <header style={{ padding: '4rem 0' }}>
                <h1 style={{ fontSize: '3rem' }}>Editorial.</h1>
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>PENSIERI SULL'ECCELLENZA E SULLO STILE.</p>
            </header>

            <div style={{ display: 'grid', gap: '4rem' }}>
                {articles.map(article => (
                    <article key={article.id} style={{ borderBottom: '1px solid rgba(245, 245, 240, 0.1)', paddingBottom: '2rem' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.1em' }}>{article.date}</span>
                        <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>{article.title}</h2>
                        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>{article.excerpt}</p>
                        <button style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--ivory)',
                            textDecoration: 'underline',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            padding: 0
                        }}>
                            Leggi l'articolo
                        </button>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Blog;
