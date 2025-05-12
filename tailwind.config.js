module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fadeOut: {
          "0%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 0, transform: "scale(0.95)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        fadeOut: "fadeOut 0.15s ease-in",
      },
    },
  },
};
