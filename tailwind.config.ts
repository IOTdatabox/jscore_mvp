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
        'primary-yellow': '#d59f2a',
        'secondary-yellow': '#c79322',
        'secondary-yellow-1': '#a17413',
        'secondary-yellow-2': '#b38013',
        'primary-gray': '#fafafa',
        // 'light-yellow': '#fbf5ea',
        'light-yellow': '#fcf8ef',
        'light-yellow-1': '#f9f1e1',
        'light-yellow-2': '#faebd7',
      },
    },
  }, 
  plugins: [
  ]
}
export default config