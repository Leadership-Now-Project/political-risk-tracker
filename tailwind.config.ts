import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Leadership Now Brand Colors
        navy: {
          DEFAULT: '#0E2344',
          50: '#E8EBF0',
          100: '#D1D7E1',
          200: '#A3AFC3',
          300: '#7587A5',
          400: '#475F87',
          500: '#0E2344',
          600: '#0B1C36',
          700: '#081528',
          800: '#050E1A',
          900: '#070F1A',
        },
        cream: {
          DEFAULT: '#F8F6F1',
          50: '#FFFFFF',
          100: '#FDFCF9',
          500: '#F8F6F1',
          600: '#EBE6D9',
        },
        gold: {
          DEFAULT: '#BDAA77',
          light: '#D7C69A',
          dark: '#9D8A57',
        },
        charcoal: '#333333',
        'ln-black': '#141413',
        'ln-red': '#C23B22',
        'ln-gray': '#C1C1C1',
        // Risk Level Colors (maintain for data visualization)
        risk: {
          low: '#22c55e',
          moderate: '#eab308',
          elevated: '#f97316',
          high: '#ef4444',
          severe: '#991b1b',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Clarkson', 'Arial', 'sans-serif'],
      },
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '40px',
        'xl': '64px',
        '2xl': '96px',
      },
      boxShadow: {
        'ln-light': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'ln-medium': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'ln-heavy': '0 8px 16px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};
export default config;
