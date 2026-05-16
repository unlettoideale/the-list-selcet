import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Phone, Clock, Star, ArrowRight, ArrowLeft, ChevronRight, ArrowDown, Globe } from 'lucide-react';

const COLORS = {
    bg: '#FDFCFB', 
    textMain: '#1A1A1A',
    textLight: '#666666',
    accent: '#B49051', 
    cardBg: '#FFFFFF'
};

const RAW_PLACES = [
    {
        id: "01",
        name: "La Terrazza della Val d'Orcia",
        category: "Visual Dining",
        location: "Pienza",
        distance: "15 km",
        driveTime: "20 min",
        stars: 0,
        phone: "+393288965140",
        timing: "Sunset & Dinner",
        price: "€€€",
        description: "Situata lungo le mura medievali di Pienza, La Terrazza non è solo un ristorante, ma un osservatorio privilegiato sulla bellezza. Qui, la cucina celebra la purezza dei sapori toscani: i pici sono tirati a mano come una volta e il pecorino di Pienza incontra il miele della valle in un connubio senza tempo.",
        conciergeTip: "Arrivi in anticipo per godersi il 'Passaggio della Luce': il momento esatto in cui il sole scompare dietro il Monte Amiata, tingendo d'oro il suo tavolo.",
        images: [
            "/restaurants/01/unnamed (1).webp",
            "/restaurants/01/2021-06-05.webp",
            "/restaurants/01/unnamed (2).webp",
            "/restaurants/01/unnamed (3).webp",
            "/restaurants/01/unnamed (4).webp",
            "/restaurants/01/unnamed (5).webp",
            "/restaurants/01/unnamed (6).webp",
            "/restaurants/01/unnamed.webp"
        ],
        website: "https://terrazzadellavaldorcia.it/",
        mapSearch: "La Terrazza della Val d'Orcia Pienza"
    },
    {
        id: "02",
        name: "Podere Il Casale",
        category: "Organic Farm-to-Table",
        location: "Pienza",
        distance: "16 km",
        driveTime: "22 min",
        stars: 0,
        phone: "+390578755109",
        timing: "Authentic Lunch",
        price: "€€",
        description: "Una fattoria biologica che è un manifesto di vita rurale consapevole. Sandra e Ulisse hanno creato un microcosmo dove il tempo è dettato dai ritmi della terra. Celebre per il suo caseificio, offre un'esperienza sensoriale cruda e autentica, dove ogni ingrediente racconta la storia del pascolo circostante.",
        conciergeTip: "Chieda di visitare il caseificio: sentire l'odore del pecorino stagionato in fossa prima di assaggiarlo nel piatto cambia totalmente la prospettiva del pasto.",
        images: [
            "/restaurants/02/8T2A0705.jpg",
            "/restaurants/02/DJI_0092.jpg",
            "/restaurants/02/IMG_5688.jpg",
            "/restaurants/02/IMG_5648.jpg",
            "/restaurants/02/IMG_5686.jpg",
            "/restaurants/02/IMG_5750.jpg",
            "/restaurants/02/unnamed (1).webp",
            "/restaurants/02/unnamed (2).webp",
            "/restaurants/02/unnamed.webp"
        ],
        website: "https://podereilcasale.com/",
        mapSearch: "Podere Il Casale Pienza"
    },
    {
        id: "03",
        name: "Il Miraggio Relais & Spa",
        category: "Wellness Gourmet",
        location: "San Quirico d'Orcia",
        distance: "13 km",
        driveTime: "18 min",
        stars: 0,
        phone: "+3905771794239",
        timing: "Elegant Dining",
        price: "€€€",
        description: "Un rifugio di quiete assoluta dove l'alta cucina si fonde con una visione olistica del benessere. La proposta gastronomica è un percorso di leggerezza e creatività, capace di rigenerare lo spirito attraverso sapori nitidi e presentazioni d'avanguardia.",
        conciergeTip: "Ideale per una cena post-trattamento spa. Si faccia consigliare un abbinamento con tisane pregiate o vini biodinamici per mantenere l'equilibrio della serata.",
        images: [
            "/restaurants/10/rosina_il-miraggio-072_1200.jpg",
            "/restaurants/10/rosina_il-miraggio-103_1200.jpg",
            "/restaurants/10/rosina_il-miraggio-061_1200.jpg",
            "/restaurants/10/rosina_il-miraggio-063_1200-1024x768.jpg",
            "/restaurants/10/rosina_il-miraggio-129_1200-1024x768.jpg",
            "/restaurants/10/rosina_il-miraggio-138_1200-1024x768.jpg"
        ],
        website: "https://www.ilmiraggioinvaldorcia.com/",
        mapSearch: "Il Miraggio Relais & Spa San Quirico d'Orcia"
    },
    {
        id: "04",
        name: "Osmosi",
        category: "Michelin Experience",
        location: "Montepulciano",
        distance: "28 km",
        driveTime: "35 min",
        stars: 1,
        phone: "+393896522511",
        timing: "Fine Dining",
        price: "€€€€",
        description: "Ospitato nella splendida cornice di Villa Svetoni, Osmosi è un laboratorio di alchimia culinaria. Lo Chef Mirko Marcelli esplora il concetto di scambio e fusione, portando in tavola piatti che sono narrazioni visive di rara eleganza e profondità gustativa.",
        conciergeTip: "Il menu 'Osmosi' è un viaggio senza mappa: si affidi completamente allo Chef per scoprire l'anima più audace di questo territorio.",
        images: [
            "/restaurants/03/unnamed (3).webp",
            "/restaurants/03/unnamed (1).webp",
            "/restaurants/03/unnamed (2).webp",
            "/restaurants/03/unnamed (4).webp",
            "/restaurants/03/unnamed (5).webp",
            "/restaurants/03/unnamed (6).webp",
            "/restaurants/03/unnamed.webp",
            "/restaurants/03/2025-07-14.webp"
        ],
        website: "https://www.osmosimontepulciano.it/",
        mapSearch: "Osmosi Montepulciano"
    },
    {
        id: "05",
        name: "Indigeno by Salcheto",
        category: "Natural & Biodynamic",
        location: "Montepulciano",
        distance: "29 km",
        driveTime: "36 min",
        stars: 0,
        phone: "+390578799031",
        timing: "Vineyard Lunch",
        price: "€€€",
        description: "Un'estensione naturale della visione sostenibile di Salcheto. Indigeno celebra il ritorno alla terra attraverso ingredienti autoctoni, coltivati negli orti della tenuta. Qui, il legame tra la vite, l'orto e la tavola è immediato, sincero e vibrante di energia naturale.",
        conciergeTip: "Scenda in cantina per vedere il futuristico impianto a energia solare: è il preludio perfetto per capire l'etica che ritroverà poi in ogni boccone.",
        images: [
            "/restaurants/05/salcheto-indigeno-duck-1.jpg",
            "/restaurants/05/PHOTO-2022-04-14-13-47-06.jpg",
            "/restaurants/05/unnamed (5).webp",
            "/restaurants/05/unnamed.webp"
        ],
        website: "https://www.salcheto.it/indigeno/",
        mapSearch: "Salcheto Montepulciano Indigeno"
    },
    {
        id: "06",
        name: "Le Logge del Vignola",
        category: "Contemporary Enoteca",
        location: "Montepulciano",
        distance: "28 km",
        driveTime: "35 min",
        stars: 0,
        phone: "+390578717290",
        timing: "Sommelier Choice",
        price: "€€€",
        description: "Un salotto intellettuale del gusto nel cuore di Montepulciano. Le Logge del Vignola è celebre per la sua enciclopedica carta dei vini e per una cucina che sa essere colta ma accessibile, capace di reinterpretare i classici con precisione e rispetto.",
        conciergeTip: "Utilizzi il loro sistema Coravin per assaggiare una riserva storica di Nobile di Montepulciano senza dover ordinare l'intera bottiglia. Un privilegio per veri intenditori.",
        images: [
            "/restaurants/11/IMG_8681-1-1024x823.jpg",
            "/restaurants/11/IMG_9301-1024x652.jpg",
            "/restaurants/11/IMG_9320-1024x681.jpg",
            "/restaurants/11/2C089220-1580-4E25-968E-2C558B708587-800x1024.jpg"
        ],
        website: "https://www.leloggedelvignola.it/",
        mapSearch: "Le Logge del Vignola Montepulciano"
    },
    {
        id: "07",
        name: "Lupaia",
        category: "Quiet Luxury Hideaway",
        location: "Torrita di Siena",
        distance: "25 km",
        driveTime: "32 min",
        stars: 0,
        phone: "+3905771917066",
        timing: "Intimate Dinner",
        price: "€€€€",
        description: "Tra le colline di Montepulciano e Pienza, Lupaia è un incantesimo di pietra e natura. La cucina è un dialogo intimo tra l'ospite e lo Chef, in un ambiente che trasuda storia e un lusso sussurrato, fatto di dettagli invisibili e attenzioni sartoriali.",
        conciergeTip: "Chieda di cenare all'aperto, sotto il pergolato: con il chiarore delle candele e il profumo del rosmarino selvatico, l'esperienza diventa puramente cinematografica.",
        images: [
            "/restaurants/06/unnamed (1).webp",
            "/restaurants/06/unnamed (2).webp",
            "/restaurants/06/unnamed.webp",
            "/restaurants/06/Entrance.webp",
            "/restaurants/06/2023-08-28.webp",
            "/restaurants/06/2024-11-27.webp",
            "/restaurants/06/2024-11-27 (1).webp",
            "/restaurants/06/lupaia-613.avif"
        ],
        website: "https://www.lupaia.com/",
        mapSearch: "Lupaia Torrita di Siena"
    },
    {
        id: "08",
        name: "Walter Redaelli",
        category: "Chianina Heritage",
        location: "Bettolle",
        distance: "35 km",
        driveTime: "40 min",
        stars: 0,
        phone: "+390577623447",
        timing: "Meat Lovers",
        price: "€€€",
        description: "Walter Redaelli è il custode della vera Bistecca alla Fiorentina. In un ambiente che è un ponte tra passato e futuro, la materia prima è la regina assoluta. La selezione della carne Chianina, frollata a regola d'arte, è una delle migliori della regione.",
        conciergeTip: "Non si fermi alla sola bistecca: provi i suoi antipasti di cacciagione. Sono la firma di uno Chef che conosce ogni segreto del bosco toscano.",
        images: [
            "/restaurants/04/unnamed (1).webp",
            "/restaurants/04/unnamed (2).webp",
            "/restaurants/04/unnamed (3).webp",
            "/restaurants/04/unnamed (4).webp",
            "/restaurants/04/unnamed.webp",
            "/restaurants/04/Immagine 206.webp",
            "/restaurants/04/rest.redaelli.si.15-390.webp"
        ],
        website: "https://www.ristoranteredaelli.it/",
        mapSearch: "Ristorante Walter Redaelli Bettolle"
    },
    {
        id: "09",
        name: "La Sala dei Grappoli",
        category: "Michelin Landmark",
        location: "Montalcino",
        distance: "40 km",
        driveTime: "50 min",
        stars: 1,
        phone: "+390577877505",
        timing: "Brunello Elite Dinner",
        price: "€€€€",
        description: "Nel cuore del maestoso Castello Banfi, questo ristorante stellato Michelin è la quintessenza dell'eleganza. Lo Chef Domenico Francone orchestra una cucina mediterranea raffinata, studiata per esaltare le sfumature delle grandi annate di Brunello di Montalcino.",
        conciergeTip: "L'esperienza qui è incompleta senza l'abbinamento 'Poggio alle Mura'. È una lezione di stile su come il vino possa elevare l'alta cucina.",
        images: [
            "/restaurants/08/unnamed (1).webp",
            "/restaurants/08/unnamed (2).webp",
            "/restaurants/08/unnamed (3).webp",
            "/restaurants/08/unnamed (4).webp",
            "/restaurants/08/unnamed (5).webp",
            "/restaurants/08/unnamed (6).webp",
            "/restaurants/08/unnamed (7).webp",
            "/restaurants/08/unnamed (8).webp",
            "/restaurants/08/unnamed.webp"
        ],
        website: "https://www.castellobanfi.com/it/banfi-a-montalcino/la-sala-dei-grappoli/",
        mapSearch: "La Sala dei Grappoli Castello Banfi Montalcino"
    },
    {
        id: "10",
        name: "La Taverna (Castello Banfi)",
        category: "Noble Tradition",
        location: "Montalcino",
        distance: "40 km",
        driveTime: "50 min",
        stars: 0,
        phone: "+390577877505",
        timing: "Gourmet Lunch",
        price: "€€€",
        description: "Ospitata nelle antiche scuderie del castello, La Taverna è un inno alla generosità toscana. Sotto le imponenti volte in mattoni, si ritrovano i sapori robusti e gentili di una volta, eseguiti con una cura tecnica da resort di lusso.",
        conciergeTip: "Il pranzo ideale: Pinci al ragù bianco e un calice di Rosso di Montalcino. Semplice, potente, perfetto.",
        images: [
            "/restaurants/09/unnamed (1).webp",
            "/restaurants/09/unnamed (2).webp",
            "/restaurants/09/unnamed (3).webp",
            "/restaurants/09/unnamed (4).webp",
            "/restaurants/09/unnamed (9).webp",
            "/restaurants/09/unnamed.webp"
        ],
        website: "https://www.castellobanfi.com/it/banfi-a-montalcino/la-taverna/",
        mapSearch: "La Taverna Castello Banfi Montalcino"
    },
    {
        id: "11",
        name: "Castello di Velona",
        category: "Thermal Castle Dining",
        location: "Montalcino",
        distance: "38 km",
        driveTime: "45 min",
        stars: 0,
        phone: "+390577839002",
        timing: "Panoramic Aperitif & Dinner",
        price: "€€€€",
        description: "Sospeso tra terra e cielo, il Castello di Velona offre una delle esperienze più iconiche della Toscana. La sua terrazza panoramica a 360 gradi domina la valle e l'Abbazia di Sant'Antimo, offrendo una cucina che è un tributo alla maestosità del luogo.",
        conciergeTip: "Prenoti per l'ora del tramonto sul bastione ovest. Vedere la Val d'Orcia che si addormenta con un calice in mano è un'emozione che vale l'intero viaggio.",
        images: [
            "/restaurants/12/09CEBBDA-DA45-49DC-BDB1-1578BBEF8C2C.webp",
            "/restaurants/12/2023-09-19.webp",
            "/restaurants/12/2024-08-30.webp",
            "/restaurants/12/2025-07-21.webp",
            "/restaurants/12/7EAD0001-FDA6-4B0D-9EC4-99B449AEA506.webp"
        ],
        website: "https://www.castellodivelona.it/",
        mapSearch: "Castello di Velona Resort Montalcino"
    }
];

const PlaceCard = ({ place }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const imgs = place.images || [place.image];

    const nextImg = (e) => {
        e.stopPropagation();
        if (currentImg < imgs.length - 1) setCurrentImg(currentImg + 1);
    };

    const prevImg = (e) => {
        e.stopPropagation();
        if (currentImg > 0) setCurrentImg(currentImg - 1);
    };

    return (
        <motion.div 
            id={`place-${place.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
                backgroundColor: '#FFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #F1F0EE',
                marginBottom: '3rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                position: 'relative',
                scrollMarginTop: '20px'
            }}
        >
            {/* Carousel Container */}
            <div style={{ position: 'relative', height: '340px', overflow: 'hidden', backgroundColor: '#EEE' }}>
                <motion.div 
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        if (offset.x < -50 && currentImg < imgs.length - 1) nextImg(e);
                        else if (offset.x > 50 && currentImg > 0) prevImg(e);
                    }}
                    style={{ height: '100%', cursor: 'grab' }}
                >
                    <img 
                        src={imgs[currentImg]} 
                        alt={place.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} 
                    />
                </motion.div>

                {/* Overlay Gradient for readability */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }} />

                {/* Nav Arrows */}
                {imgs.length > 1 && (
                    <>
                        <button 
                            onClick={prevImg}
                            style={{ 
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none',
                                borderRadius: '50%', width: '36px', height: '36px', color: '#FFF', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentImg === 0 ? 0 : 1,
                                transition: 'opacity 0.3s'
                            }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button 
                            onClick={nextImg}
                            style={{ 
                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none',
                                borderRadius: '50%', width: '36px', height: '36px', color: '#FFF', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentImg === imgs.length - 1 ? 0 : 1,
                                transition: 'opacity 0.3s'
                            }}
                        >
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {/* Dots */}
                <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {imgs.map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                width: i === currentImg ? '20px' : '6px', height: '6px', borderRadius: '3px',
                                backgroundColor: '#FFF', opacity: i === currentImg ? 1 : 0.4, transition: 'all 0.3s' 
                            }} 
                        />
                    ))}
                </div>

                {/* Badge Distance */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.05em', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    {place.distance}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: COLORS.accent, fontWeight: 700 }}>
                            {place.location} da Villa Eos
                        </span>
                        <h3 className="serif" style={{ fontSize: '2rem', margin: '0.4rem 0 0 0', color: COLORS.textMain, letterSpacing: '-0.02em' }}>{place.name}</h3>
                    </div>
                    {place.stars > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '0.6rem' }}>
                            {[...Array(place.stars)].map((_, i) => <Star key={i} size={16} fill={COLORS.accent} color={COLORS.accent} />)}
                        </div>
                    )}
                </div>

                <p style={{ fontSize: '1rem', color: COLORS.textLight, lineHeight: 1.7, marginBottom: '2rem', opacity: 0.9 }}>
                    {place.description}
                </p>

                {/* Concierge Tip Box */}
                <div style={{ backgroundColor: '#F9F7F3', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${COLORS.accent}`, marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: COLORS.accent }}>The Private Tip</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: COLORS.textMain, margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                        "{place.conciergeTip}"
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <a href={`tel:${place.phone}`} style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem',
                        borderRadius: '10px', border: '1px solid #EEE', textDecoration: 'none', color: COLORS.textMain, 
                        fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s', letterSpacing: '0.05em'
                    }}>
                        <Phone size={18} /> CHIAMA
                    </a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapSearch)}`} target="_blank" rel="noopener noreferrer" style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem',
                        borderRadius: '10px', backgroundColor: COLORS.textMain, textDecoration: 'none', color: '#FFF', 
                        fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s', letterSpacing: '0.05em'
                    }}>
                        <MapPin size={18} /> MAPPA
                    </a>
                    <a href={place.website} target="_blank" rel="noopener noreferrer" style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem',
                        borderRadius: '10px', border: '1px solid #EEE', textDecoration: 'none', color: COLORS.textMain, 
                        fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s', letterSpacing: '0.05em'
                    }}>
                        <Globe size={18} /> SITO
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

const SummaryList = () => (
    <section style={{ 
        padding: '2rem', 
        backgroundColor: '#FFF', 
        borderRadius: '16px', 
        border: '1px solid #F1F0EE',
        marginBottom: '4rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #EEE', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: COLORS.accent, fontWeight: 700, letterSpacing: '0.1em' }}>
                Distanze calcolate da Villa Eos
            </span>
        </div>
        {RAW_PLACES.map((place, index) => (
            <a 
                key={place.id} 
                href={`#place-${place.id}`}
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`place-${place.id}`).scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1.2rem 0', 
                    borderBottom: index === RAW_PLACES.length - 1 ? 'none' : '1px solid #F5F5F5',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'opacity 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <span style={{ 
                        fontFamily: 'serif', 
                        fontSize: '1.3rem', 
                        color: COLORS.accent, 
                        opacity: 0.3,
                        fontStyle: 'italic',
                        minWidth: '30px',
                        lineHeight: 1
                    }}>
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <div>
                        <h4 className="serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: COLORS.textMain, margin: '0 0 0.3rem 0', lineHeight: 1.2 }}>
                            {place.name}
                        </h4>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.65rem',
                            color: COLORS.textLight,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em'
                        }}>
                            <span style={{ color: COLORS.accent, fontWeight: 600, fontStyle: 'italic', textTransform: 'none' }}>{place.location}</span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>{place.distance}</span>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <span>{place.driveTime.replace(' ', '')}</span>
                            {place.stars > 0 && (
                                <>
                                    <span style={{ opacity: 0.3 }}>|</span>
                                    <span style={{ color: COLORS.accent, fontSize: '0.75rem' }}>{'★'.repeat(place.stars)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <ChevronRight size={18} style={{ opacity: 0.15 }} />
            </a>
        ))}
    </section>
);

const Select = () => {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const yParallax = useTransform(scrollY, [0, 1000], [0, 300]);
    const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <div ref={containerRef} style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.textMain, overflowX: 'hidden' }}>
            
            {/* Full Screen Hero Cover */}
            <header style={{ 
                height: '100vh', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#FFF',
                overflow: 'hidden',
                backgroundColor: '#000'
            }}>
                {/* Background Layer with Parallax */}
                <motion.div style={{ position: 'absolute', inset: 0, y: yParallax }}>
                    <img 
                        src="/gettyimages-108353949-612x612.jpg" 
                        alt="Val d'Orcia" 
                        style={{ width: '100%', height: '120%', objectFit: 'cover', display: 'block' }} 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.8))' }} />
                </motion.div>

                {/* Content Layer */}
                <motion.div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 2rem', opacity: opacityHero }}>
                    {/* Top Brand */}
                    <div style={{ position: 'absolute', top: '-35vh', left: 0, right: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '20px', height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
                            <span className="serif" style={{ fontSize: '0.9rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#FFF', fontStyle: 'italic' }}>
                                THE LIST SELECT
                            </span>
                            <div style={{ width: '20px', height: '1px', backgroundColor: 'rgba(255,255,255,0.4)' }} />
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}>
                        <h1 className="serif" style={{ fontSize: 'clamp(3.5rem, 15vw, 7rem)', fontWeight: 400, lineHeight: 0.9, margin: 0, letterSpacing: '-0.02em' }}>
                            Val d'Orcia
                        </h1>
                        <p className="serif" style={{ fontSize: '1.4rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem', marginBottom: '2rem' }}>
                            Una Selezione Privata
                        </p>
                        <div style={{ height: '1px', width: '40px', backgroundColor: COLORS.accent, margin: '0 auto 2rem' }} />
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: COLORS.accent, fontWeight: 500 }}>
                            Per Lorenzo Mirabella
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.5, zIndex: 10 }}
                >
                    <ArrowDown size={32} color="#FFF" strokeWidth={1} />
                </motion.div>
            </header>


            {/* Summary List & Full Selection */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.25rem' }}>
                <header style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.4em', color: COLORS.accent, display: 'block', marginBottom: '1rem', fontWeight: 600 }}>
                        The Private Index
                    </span>
                    <h2 className="serif" style={{ fontSize: 'clamp(2.5rem, 10vw, 4.2rem)', fontWeight: 400, color: COLORS.textMain, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                        L'Itinerario
                    </h2>
                    <p className="serif" style={{ fontSize: '1.1rem', fontStyle: 'italic', color: COLORS.textLight, opacity: 0.8 }}>
                        Logistica, Visione & Prestigio
                    </p>
                </header>

                <SummaryList />

                <div style={{ marginTop: '5rem' }}>
                    <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: COLORS.accent, display: 'block', marginBottom: '1rem', fontWeight: 600 }}>
                            The Collection
                        </span>
                        <h2 className="serif" style={{ fontSize: '3rem', fontWeight: 400, color: COLORS.textMain, letterSpacing: '-0.02em' }}>
                            Esperienze
                        </h2>
                    </header>
                    
                    {RAW_PLACES.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ padding: '8rem 2rem', textAlign: 'center', borderTop: '1px solid #EEE', marginTop: '6rem' }}>
                <span className="serif" style={{ fontSize: '0.9rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: COLORS.accent, fontWeight: 500 }}>
                    THE LIST SELECT
                </span>
                <p className="serif" style={{ fontStyle: 'italic', marginTop: '1.2rem', color: COLORS.textLight, fontSize: '0.95rem' }}>
                    Curated with excellence for VIP guests.
                </p>
            </footer>
        </div>
    );
};

export default Select;
