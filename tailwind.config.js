/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./stores/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)'],
                mono: ['var(--font-space-mono)'],
            },
            colors: {
                // Brand Palette
                'osce-navy': '#003366',      // Deep Blue
                'osce-blue': '#0056b3',      // Mid Blue (Link/Action)
                'osce-light-blue': '#D2E7F9', // Light Blue (Backgrounds)
                'osce-orange': '#F59E0B',    // Bright Orange (Primary)
                'osce-darkOrange': '#D97706', // Darker Orange (Hover)
            }
        },
    },
    plugins: [],
};
