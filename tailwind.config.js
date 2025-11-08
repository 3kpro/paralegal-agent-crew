/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claude AI Color Scheme
        coral: {
          50: '#fef7f5',
          100: '#fdeee9',
          200: '#fbdcd3',
          300: '#f8c1b3',
          400: '#f49d87',
          500: '#ee8b72',  // Primary coral from Claude UI
          600: '#e67056',
          700: '#d15a42',
          800: '#ad4b37',
          900: '#8f4032',
        },
        primary: {
          50: '#fef7f5',
          100: '#fdeee9',
          200: '#fbdcd3',
          300: '#f8c1b3',
          400: '#f49d87',
          500: '#ee8b72',  // Using coral as primary
          600: '#e67056',
          700: '#d15a42',
          800: '#ad4b37',
          900: '#8f4032',
        },
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#2b2b2b',  // Main background from Claude UI
          900: '#1a1a1a',
        },
        // Neutral grays for text
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        navy: '#1e293b',
        charcoal: '#374151',
        
        // LEGACY TRON COLORS - Mapped to new coral/dark scheme
        // This allows old code to work without changes
        'tron-dark': '#2b2b2b',        // → dark-800
        'tron-grid': '#343a40',        // → dark-700
        'tron-cyan': '#ee8b72',        // → coral-500
        'tron-magenta': '#e67056',     // → coral-600
        'tron-text': '#ffffff',        // → white
        'tron-text-muted': '#d1d5db',  // → gray-300
        'tron-green': '#10b981',       // → green-500
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
