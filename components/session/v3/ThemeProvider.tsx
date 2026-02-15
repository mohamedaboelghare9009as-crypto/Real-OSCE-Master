import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import './theme.css';

/**
 * Medical Simulation Theme System
 * Based on Nightingale Blue (#0474b8)
 * 
 * Features:
 * - CSS Custom Properties for theming
 * - Dark/Light mode support
 * - System preference detection
 * - Semantic color tokens
 * - Medical-appropriate color palette
 */

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultDarkMode?: boolean;
    respectSystemPreference?: boolean;
    storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
    children, 
    defaultDarkMode = false,
    respectSystemPreference = true,
    storageKey = 'medical-simulation-theme'
}) => {
    const [isDarkMode, setIsDarkMode] = useState(defaultDarkMode);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Check for stored preference
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
            setIsDarkMode(stored === 'dark');
        } else if (respectSystemPreference) {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, [respectSystemPreference, storageKey]);

    useEffect(() => {
        if (!mounted) return;
        
        // Apply dark mode class to html element for CSS variable scoping
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        
        // Store preference
        localStorage.setItem(storageKey, isDarkMode ? 'dark' : 'light');
        
        // Set meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content', 
                isDarkMode ? '#0f172a' : '#0474b8'
            );
        }
    }, [isDarkMode, mounted, storageKey]);

    // Listen for system preference changes
    useEffect(() => {
        if (!respectSystemPreference) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem(storageKey);
            // Only update if user hasn't set a preference
            if (stored === null) {
                setIsDarkMode(e.matches);
            }
        };
        
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [respectSystemPreference, storageKey]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const setDarkMode = (value: boolean) => setIsDarkMode(value);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme color constants for programmatic use
export const MEDICAL_COLORS = {
    primary: '#0474b8',
    primaryLight: '#e6f4fa',
    success: '#28a745',
    successLight: '#d4edda',
    warning: '#ffc107',
    warningLight: '#fff3cd',
    error: '#dc3545',
    errorLight: '#f8d7da',
    info: '#0556AD',
    infoLight: '#cce5ff',
    background: '#f8f8f8',
    text: '#333333',
    textLight: '#666666',
} as const;

// Helper function to get CSS variable value
export const getCssVariable = (name: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export default ThemeProvider;
