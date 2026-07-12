/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Light foreground accents (text/icons on dark surfaces)
        cream: '#F6EFE4',
        ivory: '#FFFDF9',
        beige: '#F3E9DC',
        sand: '#E9DCC9',
        gold: {
          DEFAULT: '#CBA35C',
          light: '#E8C99B',
          dark: '#A87C3C',
        },
        // Dark luxury surfaces (page → panels)
        ink: '#0B0908',
        charcoal: '#131010',
        cocoa: '#1B1613',
        espresso: '#241D18',
        panel: '#161211',
        'panel-2': '#1E1815',
        line: '#2B241E',
        muted: '#9E9082',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        soft: '0 20px 50px -20px rgba(0, 0, 0, 0.6)',
        gold: '0 14px 40px -12px rgba(203, 163, 92, 0.45)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E8C99B 0%, #CBA35C 50%, #A87C3C 100%)',
        'gold-text': 'linear-gradient(135deg, #F3DDB2 0%, #CBA35C 55%, #A87C3C 100%)',
        'hero-fade': 'linear-gradient(90deg, rgba(8,7,6,0.94) 0%, rgba(8,7,6,0.70) 45%, rgba(8,7,6,0.28) 100%)',
        'hero-bottom': 'linear-gradient(180deg, rgba(8,7,6,0) 55%, rgba(8,7,6,0.9) 100%)',
        'panel-glow': 'radial-gradient(120% 120% at 15% 0%, rgba(203,163,92,0.10) 0%, rgba(203,163,92,0) 55%)',
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
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
