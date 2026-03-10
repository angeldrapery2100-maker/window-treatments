/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Angel Drapery 品牌配色
        primary: {
          DEFAULT: '#1a1a1a', // 深灰/黑色
          light: '#2d2d2d',
          dark: '#000000',
        },
        accent: {
          DEFAULT: '#d4af37', // 金色（品牌合作伙伴）
          light: '#e5c158',
          dark: '#b8941f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
