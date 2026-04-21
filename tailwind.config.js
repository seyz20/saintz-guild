/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        '#0B1421',
        'bg-2':    '#0F1B2D',
        card:      '#132238',
        'card-2':  '#16263E',
        'table-bg':'#0E1A2B',
        border:    '#233A5B',
        'panel':   '#182C47',
        'th-bg':   '#1A2F4D',
        cyan:      '#00C2FF',
        'cyan-h':  '#1ED0FF',
        emerald:   '#00E676',
        yellow:    '#FFD54F',
        txt:       '#E6EDF7',
        muted:     '#9FB3C8',
        'muted-2': '#6E849C',
        gold:      '#F4B942',
        'gold-h':  '#D99A1E',
        indigo:    '#3FA7FF',
        purple:    '#7B2CBF',
      },
      fontFamily: { sans: ['-apple-system','BlinkMacSystemFont','Segoe UI','Roboto','sans-serif'] },
    },
  },
  plugins: [],
}
