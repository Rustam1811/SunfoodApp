/**
 * Premium Tailwind Plugin - Custom Utilities
 *
 * Adds premium dark design system utilities to Tailwind.
 * Use with: plugins: [require('./src/theme/premium-plugin.cjs')]
 *
 * @module theme/premium-plugin
 */

const plugin = require('tailwindcss/plugin');

module.exports = plugin(
  function ({ addUtilities, addComponents, theme }) {
    // Glass morphism utilities
    addUtilities({
      '.glass': {
        'background': 'rgba(255, 255, 255, 0.05)',
        'backdrop-filter': 'blur(20px)',
        '-webkit-backdrop-filter': 'blur(20px)',
        'border': '1px solid rgba(255, 255, 255, 0.1)',
      },
      '.glass-strong': {
        'background': 'rgba(255, 255, 255, 0.08)',
        'backdrop-filter': 'blur(40px)',
        '-webkit-backdrop-filter': 'blur(40px)',
        'border': '1px solid rgba(255, 255, 255, 0.15)',
      },
      '.glass-subtle': {
        'background': 'rgba(255, 255, 255, 0.03)',
        'backdrop-filter': 'blur(12px)',
        '-webkit-backdrop-filter': 'blur(12px)',
        'border': '1px solid rgba(255, 255, 255, 0.06)',
      },
    });

    // Shadow utilities
    addUtilities({
      '.shadow-glow': {
        'box-shadow': '0 0 30px 10px rgba(99, 102, 241, 0.15)',
      },
      '.shadow-glow-cyan': {
        'box-shadow': '0 18px 50px -18px rgba(56, 189, 248, 0.7)',
      },
      '.shadow-glow-success': {
        'box-shadow': '0 18px 50px -18px rgba(34, 197, 94, 0.5)',
      },
      '.shadow-card-premium': {
        'box-shadow': '0 20px 70px -30px rgba(0, 0, 0, 0.8)',
      },
      '.shadow-float-premium': {
        'box-shadow': '0 25px 70px -25px rgba(0, 0, 0, 0.8)',
      },
    });

    // Gradient utilities
    addUtilities({
      '.gradient-primary': {
        'background': 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(14, 165, 233, 0.9) 50%, rgba(34, 211, 238, 0.9) 100%)',
      },
      '.gradient-primary-text': {
        'background': 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 50%, #22d3ee 100%)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        'color': 'transparent',
      },
      '.gradient-dark': {
        'background': 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
      },
    });

    // Border utilities
    addUtilities({
      '.border-glass': {
        'border': '1px solid rgba(255, 255, 255, 0.1)',
      },
      '.border-glass-strong': {
        'border': '1px solid rgba(255, 255, 255, 0.15)',
      },
      '.border-top-glow': {
        'border-top': '1px solid rgba(255, 255, 255, 0.15)',
        'box-shadow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
    });

    // Typography utilities
    addUtilities({
      '.text-gradient': {
        'background': 'linear-gradient(135deg, #6366f1, #0ea5e9, #22d3ee)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        'color': 'transparent',
      },
      '.text-premium': {
        'font-feature-settings': '"cv02", "cv03", "cv04", "cv11"',
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
      },
    });

    // Tap target utilities
    addUtilities({
      '.tap-target': {
        'min-height': '44px',
        'min-width': '44px',
      },
      '.tap-target-lg': {
        'min-height': '48px',
        'min-width': '48px',
      },
      '.tap-target-xl': {
        'min-height': '56px',
        'min-width': '56px',
      },
    });

    // Safe area utilities
    addUtilities({
      '.pt-safe': {
        'padding-top': 'env(safe-area-inset-top, 0px)',
      },
      '.pb-safe': {
        'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      '.px-safe': {
        'padding-left': 'env(safe-area-inset-left, 0px)',
        'padding-right': 'env(safe-area-inset-right, 0px)',
      },
      '.p-safe': {
        'padding-top': 'env(safe-area-inset-top, 0px)',
        'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
        'padding-left': 'env(safe-area-inset-left, 0px)',
        'padding-right': 'env(safe-area-inset-right, 0px)',
      },
    });

    // Component presets
    addComponents({
      '.btn-premium': {
        '@apply h-14 px-6 rounded-2xl font-semibold tracking-wide': {},
        '@apply bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90': {},
        '@apply shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]': {},
        '@apply text-white transition-all duration-200': {},
        '@apply active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-sky-400/50': {},
        '@apply disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none': {},
      },
      '.btn-glass': {
        '@apply h-14 px-6 rounded-2xl font-medium tracking-wide': {},
        '@apply bg-white/5 border border-white/10 backdrop-blur-sm': {},
        '@apply text-white transition-all duration-200': {},
        '@apply hover:bg-white/10 hover:border-white/15': {},
        '@apply active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20': {},
        '@apply disabled:opacity-50 disabled:cursor-not-allowed': {},
      },
      '.card-glass': {
        '@apply rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl': {},
        '@apply shadow-[0_20px_70px_-30px_rgba(0,0,0,0.8)]': {},
      },
      '.input-glass': {
        '@apply w-full px-4 py-3 rounded-xl': {},
        '@apply bg-white/5 border border-white/10 backdrop-blur-sm': {},
        '@apply text-white placeholder:text-white/30': {},
        '@apply focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10': {},
        '@apply transition-all duration-200': {},
      },
    });
  },
  {
    // Theme extensions
    theme: {
      extend: {
        colors: {
          'pm-base': '#09090b',
          'pm-elevated': '#0f0f11',
          'pm-surface': '#18181b',
          'pm-card': 'rgba(255, 255, 255, 0.03)',
          'pm-accent': {
            DEFAULT: '#0ea5e9',
            start: '#6366f1',
            mid: '#0ea5e9',
            end: '#22d3ee',
          },
        },
        spacing: {
          'safe-t': 'env(safe-area-inset-top, 0px)',
          'safe-b': 'env(safe-area-inset-bottom, 0px)',
          'safe-l': 'env(safe-area-inset-left, 0px)',
          'safe-r': 'env(safe-area-inset-right, 0px)',
        },
        borderRadius: {
          '4xl': '2rem',
        },
        animation: {
          'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
          'shimmer': 'shimmer 2s linear infinite',
        },
        keyframes: {
          'pulse-glow': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
          'shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
        },
      },
    },
  }
);
