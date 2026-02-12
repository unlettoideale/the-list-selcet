import { useState, useEffect } from 'react';

const STORAGE_KEY = 'thelist_favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState([]);

    // Load favorites on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setFavorites(parsed);
                } else {
                    setFavorites([]);
                }
            }
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    }, []);

    const toggleFavorite = (placeId) => {
        setFavorites(prev => {
            let newFavorites;
            if (prev.includes(placeId)) {
                newFavorites = prev.filter(id => id !== placeId);
            } else {
                newFavorites = [...prev, placeId];
            }

            // Save to local storage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
            } catch (e) {
                console.error("Failed to save favorites", e);
            }

            return newFavorites;
        });
    };

    const isFavorite = (placeId) => {
        return Array.isArray(favorites) && favorites.includes(placeId);
    };

    return { favorites, toggleFavorite, isFavorite };
}
