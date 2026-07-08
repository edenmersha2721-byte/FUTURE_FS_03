/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F0',
        ivory: '#FFFDF9',
        beige: '#F3E9DC',
        sand: '#E9DCC9',
        gold: {
          DEFAULT: '#C9A15A',
          light: '#E8C99B',
          dark: '#A87C3C',
        },
        charcoal: '#1A1613',
        cocoa: '#2A231C',
        espresso: '#3B2F26',
        muted: '#6B5E52',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(60, 47, 38, 0.15)',
        gold: '0 10px 30px -8px rgba(201, 161, 90, 0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8C99B 0%, #C9A15A 50%, #A87C3C 100%)',
        'hero-fade': 'linear-gradient(90deg, rgba(26,22,19,0.92) 0%, rgba(26,22,19,0.55) 50%, rgba(26,22,19,0.15) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
