import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Enables class-based dark mode switching
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-contrast dark surfaces
        'app-dark': '#0b0c10',       // Main page canvas background
        'card-bg': '#1a1c29',        // Noticeably lighter card container surface
        'card-hover': '#222536',     // Hover state for interactive cards
        
        // Typography tokens
        'text-muted': '#9ca3af',     // Crisp, readable secondary text (gray-400)
        'text-subtle': '#d1d5db',    // High-visibility body text (gray-300)

        // Brand accent
        'accent-gold': '#f59e0b',    // Primary amber/gold accent
      },
    },
  },
  plugins: [],
};

export default config;