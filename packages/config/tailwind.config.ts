import type { Config } from 'tailwindcss';

const tailwindConfig = {
  content: [],
  theme: {
    extend: {
      colors: {
        pour: {
          DEFAULT: '#16a34a',
          light: '#86efac',
          dark: '#14532d',
        },
        contre: {
          DEFAULT: '#dc2626',
          light: '#fca5a5',
          dark: '#7f1d1d',
        },
        info: {
          DEFAULT: '#d97706',
          light: '#fde68a',
          dark: '#78350f',
        },
        blanc: {
          DEFAULT: '#6b7280',
          light: '#e5e7eb',
          dark: '#1f2937',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default tailwindConfig;
