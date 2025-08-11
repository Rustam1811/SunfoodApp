module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'premium-dark': '#0F172A', // Deep black
        'premium-blue': '#1E3A8A', // Dark blue
        'premium-white': '#FFFFFF', // Pure white
        'premium-gray': '#E2E8F0', // Light gray
        'premium-gray-dark': '#64748B', // Darker gray
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.75rem', // 12px for buttons and cards
        'xl': '1rem', // 16px for modals
      },
      padding: {
        'btn': '1rem', // 16px for buttons
        'section': '1.5rem', // 24px for sections
      },
      boxShadow: {
        'premium': '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
        'premium-hover': '0 6px 20px rgba(0, 0, 0, 0.15)', // Hover shadow
      },
      backdropBlur: {
        'sm': '4px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};