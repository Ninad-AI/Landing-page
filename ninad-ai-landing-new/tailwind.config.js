/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
        },
        accent: {
          blue: "var(--accent-blue)",
          cyan: "var(--accent-cyan)",
        },
        muted: "var(--text-muted)",
        secondary: "var(--text-secondary)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        mono: ["var(--font-ibm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
}
