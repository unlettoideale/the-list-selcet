import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#F7F2EE', minHeight: '100vh', color: '#1A1A1A' }}>
                    <h1 className="serif" style={{ color: '#9B3A4A' }}>Qualcosa è andato storto.</h1>
                    <p style={{ fontSize: '0.8rem', color: '#8A8478' }}>Si prega di ricaricare la pagina.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', fontSize: '0.6rem', textAlign: 'left', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
                        {this.state.error && this.state.error.toString()}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1.5rem', padding: '0.6rem 1.2rem',
                            background: '#9B3A4A', color: 'white', border: 'none',
                            borderRadius: '8px', cursor: 'pointer'
                        }}>
                        Ricarica Pagina
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
