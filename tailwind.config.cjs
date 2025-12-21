module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './admin/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'premium-dark': '#0B1220', // Slate-950 inspired base
        'premium-blue': '#06B6D4', // Cyan accent
        'premium-white': '#F8FAFC', // Zinc-50 surface
        'premium-gray': '#E2E8F0', // Light neutral
        'premium-gray-dark': '#1F2937', // Slate text
        'fitness-emerald': '#10B981', // Primary fitness accent
        'fitness-cyan': '#06B6D4', // Secondary techno accent
        // Premium Dark System
        'pm-base': '#09090b',
        'pm-elevated': '#0f0f11',
        'pm-surface': '#18181b',
        'pm-accent': {
          DEFAULT: '#0ea5e9',
          start: '#6366f1',
          mid: '#0ea5e9',
          end: '#22d3ee',
        },
        // Trainer OS Graphite + Wine
        'tr-base': 'var(--tr-bg-base)',
        'tr-elevated': 'var(--tr-bg-elevated)',
        'tr-card': 'var(--tr-bg-card)',
        'tr-input': 'var(--tr-bg-input)',
        'tr-hover': 'var(--tr-bg-hover)',
        'tr-active': 'var(--tr-bg-active)',
        'tr-accent': 'var(--tr-accent)',
        'tr-accent-hover': 'var(--tr-accent-hover)',
        'tr-accent-light': 'var(--tr-accent-light)',
        'tr-accent-muted': 'var(--tr-accent-muted)',
        'tr-accent-subtle': 'var(--tr-accent-subtle)',
        'tr-border': 'var(--tr-border)',
        'tr-border-subtle': 'var(--tr-border-subtle)',
        'tr-border-light': 'var(--tr-border-light)',
        'tr-border-strong': 'var(--tr-border-strong)',
        'tr-text': 'var(--tr-text-primary)',
        'tr-text-secondary': 'var(--tr-text-secondary)',
        'tr-text-muted': 'var(--tr-text-muted)',
        'tr-text-disabled': 'var(--tr-text-disabled)',
        'tr-success': 'var(--tr-success)',
        'tr-warning': 'var(--tr-warning)',
        'tr-error': 'var(--tr-error)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.75rem', // 12px for buttons and cards
        'xl': '1rem', // 16px for modals
        'tr-sm': 'var(--tr-radius-sm)',
        'tr-md': 'var(--tr-radius-md)',
        'tr-lg': 'var(--tr-radius-lg)',
        'tr-xl': 'var(--tr-radius-xl)',
        'tr-2xl': 'var(--tr-radius-2xl)',
      },
      spacing: {
        'tr-1': 'var(--tr-space-1)',
        'tr-2': 'var(--tr-space-2)',
        'tr-3': 'var(--tr-space-3)',
        'tr-4': 'var(--tr-space-4)',
        'tr-6': 'var(--tr-space-6)',
        'tr-8': 'var(--tr-space-8)',
      },
      padding: {
        'btn': '1rem', // 16px for buttons
        'section': '1.5rem', // 24px for sections
      },
      boxShadow: {
        'premium': '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow
        'premium-hover': '0 6px 20px rgba(0, 0, 0, 0.15)', // Hover shadow
        'tr-sm': 'var(--tr-shadow-sm)',
        'tr-md': 'var(--tr-shadow-md)',
        'tr-lg': 'var(--tr-shadow-lg)',
      },
      backdropBlur: {
        'sm': '4px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 50%',
        'pos-100': '100% 50%',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    require('./src/theme/premium-plugin.cjs'),
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
};
