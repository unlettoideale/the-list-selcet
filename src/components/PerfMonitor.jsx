import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PerfMonitor — Zero-overhead performance dashboard
 * Uses direct DOM manipulation for FPS to avoid React re-renders
 */

// Global fetch interceptor
const fetchStats = { count: 0, totalMs: 0, lastMs: 0 };
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    const isSupabase = url.includes('supabase');
    const start = performance.now();
    const result = await originalFetch(...args);
    if (isSupabase) {
        fetchStats.count++;
        fetchStats.totalMs += performance.now() - start;
        fetchStats.lastMs = performance.now() - start;
    }
    return result;
};

export default function PerfMonitor() {
    const [visible, setVisible] = useState(true);
    const location = useLocation();
    const frameRef = useRef([]);
    const rafRef = useRef(null);
    const pageStartRef = useRef(performance.now());

    // Direct DOM refs — no React state updates for real-time metrics
    const fpsRef = useRef(null);
    const loadRef = useRef(null);
    const dbCallsRef = useRef(null);
    const lastFetchRef = useRef(null);
    const memRef = useRef(null);
    const totalDbRef = useRef(null);
    const pageNameRef = useRef(null);

    // Track page navigation
    useEffect(() => {
        pageStartRef.current = performance.now();
        fetchStats.count = 0;
        fetchStats.totalMs = 0;
        fetchStats.lastMs = 0;

        // Update page name via DOM
        const name = location.pathname === '/' ? 'Home'
            : location.pathname.startsWith('/place') ? 'PlaceDetails'
                : location.pathname === '/nearby' ? 'NearbyPlaces'
                    : location.pathname === '/map' ? 'FullMap'
                        : location.pathname === '/saved' ? 'Saved'
                            : location.pathname === '/profile' ? 'Profile'
                                : location.pathname;
        if (pageNameRef.current) pageNameRef.current.textContent = '📍 ' + name;

        // Capture load time snapshot at 2s
        const timer = setTimeout(() => {
            const ms = Math.round(performance.now() - pageStartRef.current);
            if (loadRef.current) {
                loadRef.current.textContent = ms + 'ms';
                loadRef.current.style.color = ms < 1000 ? '#4ade80' : ms < 3000 ? '#fbbf24' : '#ef4444';
            }
        }, 2000);

        // Reset display
        if (loadRef.current) { loadRef.current.textContent = '...'; loadRef.current.style.color = '#9ca3af'; }

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // FPS + stats loop — pure DOM, zero React re-renders
    useEffect(() => {
        if (!visible) return;

        const tick = () => {
            const now = performance.now();
            frameRef.current.push(now);
            frameRef.current = frameRef.current.filter(t => now - t < 1000);
            const fps = frameRef.current.length;

            // Direct DOM writes — no setState!
            if (fpsRef.current) {
                fpsRef.current.textContent = fps;
                fpsRef.current.style.color = fps >= 50 ? '#4ade80' : fps >= 30 ? '#fbbf24' : '#ef4444';
            }
            if (dbCallsRef.current) dbCallsRef.current.textContent = fetchStats.count;
            if (lastFetchRef.current) {
                const v = fetchStats.lastMs;
                lastFetchRef.current.textContent = v ? Math.round(v) + 'ms' : '—';
                lastFetchRef.current.style.color = !v ? '#9ca3af' : v < 1000 ? '#4ade80' : v < 3000 ? '#fbbf24' : '#ef4444';
            }
            if (totalDbRef.current) totalDbRef.current.textContent = fetchStats.totalMs ? Math.round(fetchStats.totalMs) + 'ms' : '—';
            if (memRef.current && performance.memory) {
                const mb = Math.round(performance.memory.usedJSHeapSize / 1048576);
                memRef.current.textContent = mb + 'MB';
                memRef.current.style.color = mb < 100 ? '#4ade80' : '#fbbf24';
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [visible]);

    return (
        <>
            <button
                onClick={() => setVisible(!visible)}
                style={{
                    position: 'fixed', top: '12px', right: '12px', zIndex: 99999,
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: visible ? 'rgba(74,222,128,0.95)' : 'rgba(0,0,0,0.7)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: '#fff', fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)'
                }}
            >⚡</button>

            {visible && (
                <div style={{
                    position: 'fixed', top: '56px', right: '12px', zIndex: 99999,
                    background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
                    borderRadius: '12px', padding: '10px 14px', minWidth: '180px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontFamily: 'monospace', fontSize: '11px', color: '#e5e5e5',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    pointerEvents: 'none'
                }}>
                    <div ref={pageNameRef} style={{ fontWeight: 700, fontSize: '10px', color: '#a78bfa', marginBottom: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        📍 Home
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                        <Stat label="FPS" valRef={fpsRef} defaultVal="60" defaultColor="#4ade80" />
                        <Stat label="Page Load" valRef={loadRef} defaultVal="..." defaultColor="#9ca3af" />
                        <Stat label="DB Calls" valRef={dbCallsRef} defaultVal="0" defaultColor="#60a5fa" />
                        <Stat label="Last Fetch" valRef={lastFetchRef} defaultVal="—" defaultColor="#9ca3af" />
                        <Stat label="Memory" valRef={memRef} defaultVal="—" defaultColor="#4ade80" />
                        <Stat label="Total DB" valRef={totalDbRef} defaultVal="—" defaultColor="#818cf8" />
                    </div>
                </div>
            )}
        </>
    );
}

function Stat({ label, valRef, defaultVal, defaultColor }) {
    return (
        <div>
            <div style={{ fontSize: '8px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div ref={valRef} style={{ fontSize: '13px', fontWeight: 700, color: defaultColor }}>{defaultVal}</div>
        </div>
    );
}
