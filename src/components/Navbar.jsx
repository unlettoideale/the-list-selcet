import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{
            padding: '3rem 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            pointerEvents: 'none'
        }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', pointerEvents: 'auto' }}>
                <Link to="/editorial" style={{ letterSpacing: '0.2rem', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5 }}>Journal</Link>
                <Link to="/" style={{
                    letterSpacing: '0.4em',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    opacity: 1
                }} className="serif">
                    THE LIST SELECT
                </Link>
                <Link to="/map" style={{ letterSpacing: '0.2rem', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5 }}>Map</Link>
            </div>
        </nav>
    );
};

export default Navbar;
