import { motion } from 'framer-motion';

const Saved = () => {
    return (
        <div className="luxury-container" style={{ paddingTop: '6rem', minHeight: '100vh', paddingBottom: '10rem' }}>
            <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 300 }}>Saved Places</h2>
                <div style={{ width: '20px', height: '0.5px', background: 'var(--ivory)', margin: '1.5rem auto', opacity: 0.3 }}></div>
            </motion.header>

            <main style={{ textAlign: 'center', marginTop: '10rem' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.4, textTransform: 'uppercase' }}>
                    Your curated collection is empty.
                </p>
            </main>
        </div>
    );
};

export default Saved;
