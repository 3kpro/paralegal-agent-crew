/** @type {import('tailwindcss').Config} */

// Shared color palette to avoid duplication
// Source: Claude AI Color Scheme (Legacy/Fallback)
const coralPalette = {
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
};

// Animation Constants
const ANIMATION_CONSTANTS = {
  FLOAT_DISTANCE: '-10px',      // Gentle floating effect
  SLIDE_UP_START: '20px',       // Subtle upward entry
  LOADER_SIZE: '35px',          // Size of the loader segments
  FADE_IN_DURATION: '0.6s',    // Quick fade for UI availability
  SLIDE_UP_DURATION: '0.8s',   // Smooth entry for larger content
  FLOAT_DURATION: '3s',        // Slow, relaxing float cycle
  LOADER_DURATION: '2.5s',     // Cycle time for complex loader animation
};

module.exports = {
  darkMode: ["class"], // Enable class-based dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        // Claude AI Color Scheme (Legacy)
        coral: coralPalette,

        // LEGACY TRON COLORS - Mapped to new variables or closest matches to override hardcoded values
        // This allows old code to work without drastic changes while adopting the new theme
        'tron-dark': '#2b2b2b',        // → dark-800 equivalent
        'tron-grid': '#343a40',        // → dark-700 equivalent
        'tron-cyan': 'var(--primary)', // Mapped to primary blue
        'tron-magenta': 'var(--destructive)', // Mapped to destructive red
        'tron-text': 'var(--foreground)',
        'tron-text-muted': 'var(--muted-foreground)',
        'tron-green': '#10b981',       // Keeping as is for success states

        // Custom palette extensions if needed
        navy: '#1e293b',
        charcoal: '#374151',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      animation: {
        'fade-in': `fadeIn ${ANIMATION_CONSTANTS.FADE_IN_DURATION} ease-in-out`,
        'slide-up': `slideUp ${ANIMATION_CONSTANTS.SLIDE_UP_DURATION} ease-out`,
        'float': `float ${ANIMATION_CONSTANTS.FLOAT_DURATION} ease-in-out infinite`,
        'loaderAnim': `loaderAnim ${ANIMATION_CONSTANTS.LOADER_DURATION} infinite`,
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: `translateY(${ANIMATION_CONSTANTS.SLIDE_UP_START})`, opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: `translateY(${ANIMATION_CONSTANTS.FLOAT_DISTANCE})` },
        },
        loaderAnim: {
          '0%': { inset: `0 ${ANIMATION_CONSTANTS.LOADER_SIZE} ${ANIMATION_CONSTANTS.LOADER_SIZE} 0` },
          '12.5%': { inset: `0 ${ANIMATION_CONSTANTS.LOADER_SIZE} 0 0` },
          '25%': { inset: `${ANIMATION_CONSTANTS.LOADER_SIZE} ${ANIMATION_CONSTANTS.LOADER_SIZE} 0 0` },
          '37.5%': { inset: `${ANIMATION_CONSTANTS.LOADER_SIZE} 0 0 0` },
          '50%': { inset: `${ANIMATION_CONSTANTS.LOADER_SIZE} 0 0 ${ANIMATION_CONSTANTS.LOADER_SIZE}` },
          '62.5%': { inset: `0 0 0 ${ANIMATION_CONSTANTS.LOADER_SIZE}` },
          '75%': { inset: `0 0 ${ANIMATION_CONSTANTS.LOADER_SIZE} ${ANIMATION_CONSTANTS.LOADER_SIZE}` },
          '87.5%': { inset: `0 0 ${ANIMATION_CONSTANTS.LOADER_SIZE} 0` },
          '100%': { inset: `0 ${ANIMATION_CONSTANTS.LOADER_SIZE} ${ANIMATION_CONSTANTS.LOADER_SIZE} 0` },
        },
      },
    },
  },
  plugins: [],
}
