import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--text-primary)',
        primaryAccent: 'var(--main-surface-primary)',
        brand: 'var(--text-primary)',
        background: {
          DEFAULT: 'var(--main-surface-primary)',
          secondary: 'var(--main-surface-secondary)'
        },
        secondary: 'var(--text-secondary)',
        foreground: 'var(--text-primary)',
        'primary-foreground': '#ffffff',
        'secondary-foreground': 'var(--text-primary)',
        'accent-foreground': 'var(--text-primary)',
        'destructive-foreground': '#ffffff',
        'muted-foreground': 'var(--text-tertiary)',
        placeholder: 'var(--text-placeholder)',
        border: 'var(--border-light)',
        'surface-hover': 'var(--surface-hover)',
        accent: 'var(--main-surface-tertiary)',
        muted: 'var(--text-tertiary)',
        destructive: '#991b1b',
        positive: 'var(--text-primary)',
        input: 'var(--border-medium)',
        ring: 'var(--border-medium)',
        link: 'var(--link)',
        'link-hover': 'var(--link-hover)'
      },
      fontFamily: {
        geist: 'var(--font-geist-sans)',
        dmmono: 'var(--font-dm-mono)'
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config
