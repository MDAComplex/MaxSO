import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0A0A0B',
          surface: '#111113',
          elevated: '#18181B',
          border: '#1F1F23',
          borderHover: '#2A2A30',
        },
        text: {
          primary: '#F4F4F5',
          secondary: '#A1A1AA',
          tertiary: '#52525B',
        },
        accent: {
          DEFAULT: '#38BDF8',
          dim: '#0EA5E9',
          subtle: 'rgba(56,189,248,0.1)',
          border: 'rgba(56,189,248,0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
export default config
