module.exports = {
  mode: 'jit',
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: [
    'bg-gradient-to-r',
    'from-[#C58940]',
    'to-[#A67C52]',
    'bg-[#FAF3E0]',
    'shadow-lg',
    'hover:scale-105',
    'transition-transform',
    'rounded-2xl',
    'bg-gradient-to-b',
    
  ],
  
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      transitionTimingFunction: {
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      colors: {
        primary: "#C58940",  // Тёплый кофейный
        secondary: "#ECD8BB", // Кремовый
        accent: "#8D6E63",    // Орехово-шоколадный
        background: "#FAF3E0", // Светлый бежевый
        text: "#4A3F35",       // Глубокий кофейный
        success: "#A3C48D",   // Фисташковый
        warning: "#E9B44C",   // Горчичный
        danger: "#D16B5D",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
