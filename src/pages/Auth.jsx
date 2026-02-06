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
    const [view, setView] = useState('login'); // 'login', 'signup', 'verify'
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
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) videoRef.current.play().catch(() => { });
    }, []);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });
            if (error) throw error;
            setResendTimer(60);
            setError(null);
        } catch (err) {
            setError("Impossibile inviare un nuovo codice.");
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setPhone(val);
    };

    const handleSocialLogin = async (provider) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(`Impossibile accedere con ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
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
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            phone: `${prefix}${phone}`,
                            birthday: birthday,
                            marketing_accepted: marketingAccepted,
                        }
                    }
                });
                if (error) throw error;
                setView('verify');
            }
        } catch (err) {
            setError(err.message === 'Invalid login credentials' ? 'Credenziali non valide' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = otp.join('');

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'signup'
            });
            if (error) throw error;
        } catch (err) {
            setError("Codice non valido o scaduto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell" style={{
            background: 'radial-gradient(circle at center, #5D1219 0%, #1A0406 70%, #0D0203 100%)',
            minHeight: '100vh',
            justifyContent: 'center'
        }}>
            <div className="luxury-container" style={{ padding: '0 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>


                <header style={{
                    marginBottom: view === 'login' ? '5rem' : '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h1 className="logo-main" style={{ fontSize: view === 'verify' ? '2rem' : (view === 'login' ? '3.5rem' : '2.2rem') }}>
                            {view === 'verify' ? 'VERIFICA' : 'THE LIST'}
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        style={{ textAlign: 'center', width: '100%' }}
                    >
                        <div style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.8em',
                            textTransform: 'uppercase',
                            marginTop: '1rem',
                            paddingLeft: '0.8em' // Offset for letter-spacing to truly center
                        }}>
                            {view === 'verify' ? 'IDENTITÀ' : 'SELECT'}
                        </div>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {view === 'verify' ? (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.5, marginBottom: '2.5rem', letterSpacing: '0.05em', lineHeight: 1.6 }}>
                                Inserisci il codice a 6 cifre inviato a:<br />
                                <span style={{ color: 'var(--gold)', opacity: 1, fontSize: '0.8rem', fontStyle: 'italic' }}>{email}</span>
                            </p>

                            <form onSubmit={handleVerifyOtp}>
                                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '3rem' }}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => otpRefs.current[idx] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                            style={{
                                                width: '40px',
                                                height: '55px',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: digit ? '2px solid var(--ivory)' : '1px solid var(--border)',
                                                textAlign: 'center',
                                                fontSize: '1.5rem',
                                                color: 'var(--ivory)',
                                                fontFamily: 'serif',
                                                transition: 'all 0.3s ease',
                                                outline: 'none'
                                            }}
                                        />
                                    ))}
                                </div>

                                {error && <p style={{ color: '#C5A059', fontSize: '0.65rem', textAlign: 'center', marginBottom: '2rem' }}>{error}</p>}

                                <button type="submit" className="luxury-button" disabled={loading || otp.includes('')}>
                                    {loading ? 'Verifica in corso...' : 'Conferma Accesso'}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0 || loading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--gold)',
                                            fontSize: '0.6rem',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            cursor: resendTimer > 0 ? 'default' : 'pointer',
                                            opacity: resendTimer > 0 ? 0.3 : 0.6
                                        }}
                                    >
                                        {resendTimer > 0 ? `Invia nuovo codice in ${resendTimer}s` : 'Invia di nuovo il codice'}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setView('signup')}
                                    style={{ background: 'none', border: 'none', color: 'var(--ivory)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', width: '100%', marginTop: '2.5rem', opacity: 0.3, cursor: 'pointer' }}
                                >
                                    Modifica Dati
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={view}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <form onSubmit={handleAuth} style={{ display: 'grid', gap: '0.6rem' }}>
                                {view === 'signup' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="luxury-input-group">
                                                <input type="text" placeholder="Nome" className="luxury-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                            </div>
                                            <div className="luxury-input-group">
                                                <input type="text" placeholder="Cognome" className="luxury-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '80px' }}>
                                                <select value={prefix} onChange={(e) => setPrefix(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ivory)', fontSize: '0.9rem', padding: '1.5rem 0', outline: 'none', cursor: 'pointer', appearance: 'none', fontFamily: 'serif' }}>
                                                    {countryCodes.map(c => <option key={c.code} value={c.code} style={{ background: '#1A0406' }}>{c.label} {c.code}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input type="tel" placeholder="Cellulare" className="luxury-input" value={phone} onChange={handlePhoneChange} required style={{ borderBottom: 'none', padding: '1.5rem 0' }} />
                                            </div>
                                        </div>
                                        <div className="luxury-input-group">
                                            <input type="date" className="luxury-input" value={birthday} onChange={(e) => setBirthday(e.target.value)} required style={{ color: birthday ? 'var(--ivory)' : 'rgba(245, 245, 240, 0.3)' }} />
                                            <span style={{ fontSize: '0.55rem', opacity: 0.3, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>Data di Nascita</span>
                                        </div>
                                    </>
                                )}

                                <div className="luxury-input-group">
                                    <input type="email" placeholder="E-mail" className="luxury-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>

                                <div className="luxury-input-group" style={{ position: 'relative' }}>
                                    <input type={showPassword ? "text" : "password"} placeholder="Chiave di Accesso" className="luxury-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ivory)', opacity: 0.3, fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: '1rem 0.5rem' }}>
                                        {showPassword ? 'Nascondi' : 'Mostra'}
                                    </button>
                                </div>

                                {view === 'signup' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setMarketingAccepted(!marketingAccepted)}>
                                            <div style={{ width: '16px', height: '16px', border: '1px solid var(--border)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: marketingAccepted ? 'var(--ivory)' : 'transparent' }}>
                                                {marketingAccepted && <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--bordeaux-deep)' }} />}
                                            </div>
                                            <p style={{ fontSize: '0.6rem', opacity: 0.4, lineHeight: 1.4 }}>Desidero ricevere comunicazioni esclusive e aggiornamenti.</p>
                                        </div>
                                        <p style={{ fontSize: '0.55rem', opacity: 0.2, textAlign: 'center' }}>Premendo Iscriviti, accetti i Termini e la Privacy Policy.</p>
                                    </div>
                                )}

                                {error && <p style={{ color: '#C5A059', fontSize: '0.65rem', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}

                                <div style={{ marginTop: '2rem' }}>
                                    <button type="submit" className="luxury-button" disabled={loading}>
                                        {loading ? 'Caricamento...' : (view === 'login' ? 'Accedi' : 'Iscriviti')}
                                    </button>
                                </div>
                            </form>

                            {/* Social Login Section */}
                            <div style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                    <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', opacity: 0.3, textTransform: 'uppercase' }}>oppure</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--border)',
                                            background: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c3.15 0 5.8-1.05 7.73-2.85l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.1 20.59 7.83 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 13.91c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.89H2.18c-.77 1.54-1.21 3.27-1.21 5.1s.44 3.56 1.21 5.11l3.66-2.8z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.72 0 3.26.59 4.47 1.74l3.35-3.35C17.81 1.83 15.15 1 12 1 7.83 1 4.1 3.41 2.18 6.89l3.66 2.8c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleSocialLogin('apple')}
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            border: '1px solid var(--border)',
                                            background: 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 256 315" fill="var(--ivory)">
                                            <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.335 1.01-6.585 22.568-21.714 44.62-13.079 19.036-26.56 38.016-47.852 38.396-21.037.388-27.733-12.423-51.728-12.423-23.99 0-31.427 12.037-51.356 12.821-20.67.764-36.22-20.63-49.385-39.638-26.93-38.916-47.513-110.126-19.952-157.925 13.682-23.712 38.084-38.744 64.66-39.117 20.3-.306 39.46 13.784 51.933 13.784 12.488 0 35.632-17.16 60.106-14.67 10.237.424 39.04 4.135 57.5 31.182-1.493.92-34.35 20.012-33.91 59.35zM176.533 40.584c11.082-13.433 18.534-32.09 16.5-50.714-15.992.645-35.352 10.662-46.852 24.088-10.324 11.916-19.412 30.932-17.02 49.19 17.844 1.392 36.295-9.13 47.372-22.564z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                                    style={{ background: 'none', border: 'none', color: 'var(--ivory)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', borderBottom: '1px solid rgba(245, 245, 240, 0.2)' }}
                                >
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
