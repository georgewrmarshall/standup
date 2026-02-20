const designSystemPreset = require('@metamask/design-system-tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [designSystemPreset],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './node_modules/@metamask/design-system-react/dist/**/*.{js,mjs}',
  ],
  theme: {
    // Keep essential semantic colors, remove default palette colors.
    // We want to rely on the colors provided by @metamask/design-system-tailwind-preset
    colors: {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      black: '#000000',
      white: '#ffffff',
    },
    // This removes all default Tailwind font sizes and weights.
    // We want to rely on the design system font sizes and enforce use of the Text component
    fontSize: {},
    fontWeight: {},
  },
  plugins: [],
};