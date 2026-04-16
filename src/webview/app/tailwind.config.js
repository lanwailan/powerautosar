/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Dark Theme - stitch palette
        background: '#0e0e11',
        'surface-dim': '#0e0e11',
        'surface-container-lowest': '#000000',
        'surface-container-low': '#131317',
        'surface-container': '#19191e',
        'surface-container-high': '#1f1f26',
        'surface-container-highest': '#24252d',
        'surface-bright': '#2a2b35',
        'surface-variant': '#24252d',

        primary: '#9fcaff',
        'primary-dim': '#83bdff',
        'primary-container': '#00497d',
        'primary-fixed': '#d1e4ff',
        'primary-fixed-dim': '#b8d7ff',
        'on-primary': '#004272',
        'on-primary-container': '#b1d3ff',
        'on-primary-fixed': '#004171',
        'on-primary-fixed-variant': '#005e9f',

        secondary: '#9c9ea3',
        'secondary-dim': '#9c9ea3',
        'secondary-container': '#393c40',
        'secondary-fixed': '#e1e2e8',
        'secondary-fixed-dim': '#d3d4da',
        'on-secondary': '#1d2025',
        'on-secondary-container': '#bdbfc5',
        'on-secondary-fixed': '#3d3f44',
        'on-secondary-fixed-variant': '#595c61',

        tertiary: '#ececff',
        'tertiary-dim': '#ccd0ef',
        'tertiary-container': '#dbdefe',
        'tertiary-fixed': '#dbdefe',
        'tertiary-fixed-dim': '#ccd0ef',
        'on-tertiary': '#535771',
        'on-tertiary-container': '#4a4e69',
        'on-tertiary-fixed': '#383c55',
        'on-tertiary-fixed-variant': '#545873',

        error: '#ee7d77',
        'error-dim': '#bb5551',
        'error-container': '#7f2927',
        'on-error': '#490106',
        'on-error-container': '#ff9993',

        outline: '#75757e',
        'outline-variant': '#474750',

        'on-surface': '#e6e4ef',
        'on-surface-variant': '#abaab4',
        'on-background': '#e6e4ef',

        'surface-tint': '#9fcaff',
        inverse: '#fbf8fc',
        'inverse-surface': '#fbf8fc',
        'inverse-on-surface': '#555458',
        'inverse-primary': '#0062a5',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
};
