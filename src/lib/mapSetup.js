// MapLibre GL Setup — styles, config, theme switching
// Uses free MapTiler tiles for vector rendering

// Free tile styles (no API key needed for basic OSM)
const TILE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const TILE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// Get current theme
export function getMapStyle() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? TILE_LIGHT : TILE_DARK;
}

// Category colors for luxury aesthetic
export const CATEGORY_COLORS = {
    RESTAURANT: '#9B3A4A', // Deep App Burgundy
    ROOFTOP: '#B88B4A', // Antique Gold
    HOTEL: '#3D3428', // Dark Bronze
    BREAKFAST_BAR: '#D4A86A', // Classic Gold
    COCKTAIL_BAR: '#6D214F', // Magenta Night
    DEFAULT: '#8A7B6B', // Warm Gray
};

export const CATEGORY_ICONS = {
    RESTAURANT: '<path d="M12 2v20M7 2v10c0 1.1.9 2 2 2h2M17 2v20"/>', // Fork & Knife abstract
    ROOFTOP: '<path d="M2 17h20M7 7l5-5 5 5M12 2v15"/>', // Sunset/Roof
    HOTEL: '<path d="M2 22h20M7 14h10M2 18h20M5 18v-4a2 2 0 012-2h10a2 2 0 012 2v4"/>', // Bed
    BREAKFAST_BAR: '<path d="M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/>', // Cup
    COCKTAIL_BAR: '<path d="M22 2L12 13 2 2M12 13v9M7 21h10"/>', // Martini
    DEFAULT: '<circle cx="12" cy="12" r="3"/>',
};

export function getCategoryColor(cat) {
    return CATEGORY_COLORS[cat] || CATEGORY_COLORS.DEFAULT;
}

/**
 * Create a DOM element for a luxury category marker
 */
export function createMarkerElement(category, size = 42) {
    const color = getCategoryColor(category);
    const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.DEFAULT;
    const el = document.createElement('div');
    el.className = 'luxury-marker';

    // Injecting a refined SVG pin
    el.innerHTML = `
        <svg width="${size}" height="${size * 1.2}" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow" x="0" y="0" width="40" height="52" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
            </filter>
            <!-- Outer Pin Shape -->
            <path d="M20 46.5L13.5 37.5C8 30 4 25.5 4 18C4 9.16344 11.1634 2 20 2C28.8366 2 36 9.16344 36 18C36 25.5 32 30 26.5 37.5L20 46.5Z" 
                  fill="${color}" stroke="white" stroke-width="1.5" filter="url(#shadow)"/>
            <!-- Icon area -->
            <g transform="translate(8, 8) scale(1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    ${icon}
                </svg>
            </g>
        </svg>
    `;

    el.style.cssText = `
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.2) translateY(-4px)');
    el.addEventListener('mouseleave', () => el.style.transform = 'scale(1) translateY(0)');

    return el;
}

/**
 * Create a cluster marker element with glassmorphism
 */
export function createClusterElement(count) {
    const el = document.createElement('div');
    const size = count > 50 ? 54 : count > 20 ? 46 : 38;
    el.className = 'luxury-cluster';
    el.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: rgba(26, 22, 20, 0.85);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #D4A86A; font-weight: 600;
        font-size: ${size * 0.32}px;
        font-family: var(--font-serif, 'Playfair Display', serif);
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
    `;
    el.textContent = count;
    el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.background = 'rgba(155, 58, 74, 0.9)';
        el.style.color = '#fff';
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.background = 'rgba(26, 22, 20, 0.85)';
        el.style.color = '#D4A86A';
    });
    return el;
}
