/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1c1510',
          card: '#251a12',
          elevated: '#2e2016',
        },
        accent: {
          DEFAULT: '#e8956d',
          dim: 'rgba(232,149,109,0.14)',
        },
        gold: '#e8c97a',
        purple: '#c4a8d4',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        xl: '22px',
      },
    },
  },
  plugins: [],
}
