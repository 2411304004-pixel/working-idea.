/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f3ee",
        "surface-container": "#f1ede8",
        "surface-container-high": "#ebe8e3",
        "surface-container-highest": "#e6e2dd",
        "surface": "#fdf9f4",
        "background": "#fdf9f4",
        "surface-bright": "#fdf9f4",
        "surface-dim": "#ddd9d5",
        "surface-variant": "#e6e2dd",
        "surface-tint": "#aa3614",

        "primary": "#a73412",
        "primary-accent": "#e8623d",
        "primary-container": "#c94b28",
        "primary-fixed": "#ffdbd1",
        "primary-fixed-dim": "#ffb5a1",
        "on-primary": "#ffffff",
        "on-primary-container": "#fffbff",
        "on-primary-fixed": "#3b0900",
        "on-primary-fixed-variant": "#882000",
        "inverse-primary": "#ffb5a1",

        "secondary": "#35675a",
        "secondary-container": "#b8eedc",
        "secondary-fixed": "#b8eedc",
        "secondary-fixed-dim": "#9dd1c1",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#3b6d60",
        "on-secondary-fixed": "#002019",
        "on-secondary-fixed-variant": "#1b4f43",

        "tertiary": "#615b55",
        "tertiary-container": "#7a736d",
        "tertiary-fixed": "#eae1d9",
        "tertiary-fixed-dim": "#cdc5be",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fffbff",
        "on-tertiary-fixed": "#1f1b16",
        "on-tertiary-fixed-variant": "#4b4640",

        "on-surface": "#1c1c19",
        "on-surface-variant": "#58413b",
        "inverse-surface": "#31302d",
        "inverse-on-surface": "#f4f0eb",

        "outline": "#8c716a",
        "outline-variant": "#e0bfb7",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.25rem",
        full: "9999px"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        serif: ["Georgia", "serif"]
      },
      spacing: {
        gutter: "1rem",
        "gutter-desktop": "1.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      }
    },
  },
  plugins: [],
}
