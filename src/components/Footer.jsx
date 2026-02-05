import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            padding: '4rem 1.5rem',
            borderTop: '1px solid rgba(245, 245, 240, 0.05)',
            marginTop: '2rem',
            textAlign: 'center'
        }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <Link to="/" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Home</Link>
                <Link to="/editorial" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Editorial</Link>
            </div>
            <p style={{ fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.05em' }}>
                © 2026 THE LIST SELECT. ALL RIGHTS RESERVED.
            </p>
        </footer>
    );
};

export default Footer;
