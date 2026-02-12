import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const countryCodes = [
    { code: '+39', label: 'ITA' },
    { code: '+44', label: 'UK' },
    { code: '+1', label: 'US' },
    { code: '+33', label: 'FRA' },
    { code: '+49', label: 'GER' },
    { code: '+34', label: 'ESP' },
    { code: '+41', label: 'SUI' },
];

const Auth = () => {
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [prefix, setPrefix] = useState('+39');
    const [phone, setPhone] = useState('');
    const [birthday, setBirthday] = useState('');
    const [marketingAccepted, setMarketingAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef([]);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({ type: 'signup', email });
            if (error) throw error;
            setResendTimer(60);
            setError(null);
        } catch { setError("Impossibile inviare un nuovo codice."); }
        finally { setLoading(false); }
    };

    const handlePhoneChange = (e) => setPhone(e.target.value.replace(/\D/g, ''));

    const handleSocialLogin = async (provider) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
            if (error) throw error;
        } catch (err) { setError(`Impossibile accedere con ${provider}`); }
        finally { setLoading(false); }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1].focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { first_name: firstName, last_name: lastName, phone: `${prefix}${phone}`, birthday, marketing_accepted: marketingAccepted } }
                });
                if (error) throw error;
                setView('verify');
            }
        } catch (err) { setError(err.message === 'Invalid login credentials' ? 'Credenziali non valide' : err.message); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.verifyOtp({ email, token: otp.join(''), type: 'signup' });
            if (error) throw error;
        } catch { setError("Codice non valido o scaduto."); }
        finally { setLoading(false); }
    };

    const inputStyle = {
        width: '100%', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px', padding: '1rem', color: '#1A1A1A', fontSize: '0.95rem',
        outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.3s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
    };

    return (
        <div style={{
            background: '#F7F2EE', minHeight: '100vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ width: '100%', maxWidth: '380px', padding: '3rem 2rem' }}>

                {/* Logo */}
                <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: view === 'login' ? '2.5rem' : '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#9B3A4A', lineHeight: 1 }}>THE</span>
                        <div style={{ width: '36px', height: '1px', background: 'linear-gradient(90deg, transparent, #C4956A, transparent)', margin: '4px 0' }} />
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1 }}>LIST</span>
                    </div>
                    {view === 'verify' ? (
                        <h1 className="serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#1A1A1A', margin: 0 }}>Verifica Identità</h1>
                    ) : (
                        <p style={{ fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#B5AEA5', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>selected.</p>
                    )}
                </motion.header>

                <AnimatePresence mode="wait">
                    {view === 'verify' ? (
                        <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#8A8478', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Codice a 6 cifre inviato a:<br />
                                <span style={{ color: '#9B3A4A', fontWeight: 600 }}>{email}</span>
                            </p>
                            <form onSubmit={handleVerifyOtp}>
                                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
                                    {otp.map((digit, idx) => (
                                        <input key={idx} ref={el => otpRefs.current[idx] = el}
                                            type="text" inputMode="numeric" maxLength={1} value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            style={{
                                                width: '42px', height: '52px', background: '#FFFFFF',
                                                border: digit ? '1.5px solid #9B3A4A' : '1px solid rgba(0,0,0,0.08)',
                                                borderRadius: '10px', textAlign: 'center', fontSize: '1.4rem',
                                                color: '#1A1A1A', fontFamily: 'var(--font-serif)', outline: 'none',
                                                transition: 'all 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                                            }}
                                        />
                                    ))}
                                </div>
                                {error && <p style={{ color: '#9B3A4A', fontSize: '0.65rem', textAlign: 'center', marginBottom: '1.5rem' }}>{error}</p>}
                                <button type="submit" className="luxury-button" disabled={loading || otp.includes('')}>
                                    {loading ? 'Verifica...' : 'Conferma'}
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
                                    <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0 || loading}
                                        style={{ background: 'none', border: 'none', color: '#9B3A4A', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: resendTimer > 0 ? 'default' : 'pointer', opacity: resendTimer > 0 ? 0.3 : 0.7 }}>
                                        {resendTimer > 0 ? `Nuovo codice in ${resendTimer}s` : 'Invia di nuovo'}
                                    </button>
                                </div>
                                <button type="button" onClick={() => setView('signup')}
                                    style={{ background: 'none', border: 'none', color: '#8A8478', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', width: '100%', marginTop: '2rem', cursor: 'pointer' }}>
                                    Modifica Dati
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '0.8rem' }}>
                                {view === 'signup' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                            <input type="text" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                                            <input type="text" placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                                            <select value={prefix} onChange={(e) => setPrefix(e.target.value)}
                                                style={{ ...inputStyle, width: '90px', appearance: 'none', textAlign: 'center', fontWeight: 600 }}>
                                                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label} {c.code}</option>)}
                                            </select>
                                            <input type="tel" placeholder="Cellulare" value={phone} onChange={handlePhoneChange} required style={{ ...inputStyle, flex: 1 }} />
                                        </div>
                                        <div>
                                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required
                                                style={{ ...inputStyle, color: birthday ? '#1A1A1A' : '#B5AEA5' }} />
                                            <span style={{ fontSize: '0.5rem', color: '#B5AEA5', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block', paddingLeft: '4px' }}>Data di Nascita</span>
                                        </div>
                                    </>
                                )}

                                <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />

                                <div style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9B3A4A', fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
                                        {showPassword ? 'Nascondi' : 'Mostra'}
                                    </button>
                                </div>

                                {view === 'signup' && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', cursor: 'pointer' }} onClick={() => setMarketingAccepted(!marketingAccepted)}>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '4px',
                                                border: marketingAccepted ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                                                background: marketingAccepted ? '#9B3A4A' : '#FFFFFF',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginTop: '1px', flexShrink: 0, transition: 'all 0.2s ease'
                                            }}>
                                                {marketingAccepted && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
                                            </div>
                                            <p style={{ fontSize: '0.6rem', color: '#8A8478', lineHeight: 1.5 }}>Desidero ricevere comunicazioni esclusive e aggiornamenti.</p>
                                        </div>
                                        <p style={{ fontSize: '0.5rem', color: '#B5AEA5', textAlign: 'center', marginTop: '0.8rem' }}>Premendo Iscriviti, accetti i Termini e la Privacy Policy.</p>
                                    </div>
                                )}

                                {error && <p style={{ color: '#9B3A4A', fontSize: '0.65rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</p>}

                                <div style={{ marginTop: '1rem' }}>
                                    <button type="submit" className="luxury-button" disabled={loading}>
                                        {loading ? 'Caricamento...' : (view === 'login' ? 'Accedi' : 'Iscriviti')}
                                    </button>
                                </div>
                            </form>

                            {/* Social */}
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                                    <span style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: '#B5AEA5', textTransform: 'uppercase' }}>oppure</span>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                                    <button onClick={() => handleSocialLogin('google')}
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c3.15 0 5.8-1.05 7.73-2.85l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.1 20.59 7.83 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 13.91c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.89H2.18c-.77 1.54-1.21 3.27-1.21 5.1s.44 3.56 1.21 5.11l3.66-2.8z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.72 0 3.26.59 4.47 1.74l3.35-3.35C17.81 1.83 15.15 1 12 1 7.83 1 4.1 3.41 2.18 6.89l3.66 2.8c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleSocialLogin('apple')}
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                        <svg width="20" height="20" viewBox="0 0 256 315" fill="#1A1A1A">
                                            <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.335 1.01-6.585 22.568-21.714 44.62-13.079 19.036-26.56 38.016-47.852 38.396-21.037.388-27.733-12.423-51.728-12.423-23.99 0-31.427 12.037-51.356 12.821-20.67.764-36.22-20.63-49.385-39.638-26.93-38.916-47.513-110.126-19.952-157.925 13.682-23.712 38.084-38.744 64.66-39.117 20.3-.306 39.46 13.784 51.933 13.784 12.488 0 35.632-17.16 60.106-14.67 10.237.424 39.04 4.135 57.5 31.182-1.493.92-34.35 20.012-33.91 59.35zM176.533 40.584c11.082-13.433 18.534-32.09 16.5-50.714-15.992.645-35.352 10.662-46.852 24.088-10.324 11.916-19.412 30.932-17.02 49.19 17.844 1.392 36.295-9.13 47.372-22.564z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                    style={{ background: 'none', border: 'none', color: '#9B3A4A', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600 }}>
                                    {view === 'login' ? "Registrati" : "Accedi"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;
