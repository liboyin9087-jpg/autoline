/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: { 
        'fairy-primary': '#fbbf24',
        'fairy-dark': '#f59e0b',
        'fairy-bg': '#fffbeb',
        'fairy-accent': '#ec4899',
        'fairy-text': '#404040',
        'persona-consultant': '#7c3aed',
        'persona-friend': '#ec4899',
        'persona-concise': '#f97316',
        'persona-creative': '#06b6d4',
        'persona-tech': '#3b82f6',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'float': '0 12px 32px rgba(0, 0, 0, 0.15)',
      },
      animation: { 
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite' 
      },
      keyframes: { 
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: { 
          '0%, 100%': { transform: 'translateY(0)' }, 
          '50%': { transform: 'translateY(-10px)' } 
        } 
      }
    },
  },
  plugins: [],
}
