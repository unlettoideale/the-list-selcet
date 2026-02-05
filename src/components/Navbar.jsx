import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{
            padding: '2rem 1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(10, 10, 10, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 100
        }}>
            <Link to="/" style={{ letterSpacing: '0.2em', fontSize: '1.2rem' }} className="serif">
                THE LIST SELECT
            </Link>
        </nav>
    );
};

export default Navbar;
