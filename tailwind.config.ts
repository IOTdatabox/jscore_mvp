import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'Inter': ['"Inter"'],
      },
      colors: {
        'primary-cyan': '#50858B',
        'secondary-cyan': '#5497A7',
        'secondary-cyan-1': '#5497A7',
        'light-cyan': '#E6F0EF',
      },
    },
  }, 
  plugins: [
  ]
}
export default config