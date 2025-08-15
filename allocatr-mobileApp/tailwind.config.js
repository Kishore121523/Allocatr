/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#f8f7fa',
        foreground: '#3d3c4f',
        card: '#ffffff',
        'card-foreground': '#3d3c4f',
        popover: '#ffffff',
        'popover-foreground': '#3d3c4f',
        primary: '#ed7105',
        'primary-foreground': '#f8f7fa',
        secondary: '#dfd9ec',
        'secondary-foreground': '#3d3c4f',
        muted: '#dcd9e3',
        'muted-foreground': '#6b6880',
        accent: '#e8e7e9',
        'accent-foreground': '#1e1b4b',
        destructive: '#dc2626',
        'destructive-foreground': '#fef2f2',
        warning: '#ea580c',
        'warning-foreground': '#fef3c7',
        success: '#16a34a',
        'success-foreground': '#f0fdf4',
        border: '#d6d3d1',
        input: '#d6d3d1',
        ring: '#2563eb',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
      },
    },
  },
  plugins: [],
}