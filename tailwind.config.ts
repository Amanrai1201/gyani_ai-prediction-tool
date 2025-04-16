import type { Config } from "tailwindcss";
import { heroui, HeroUIPluginConfig } from '@heroui/react'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(button|modal|navbar|ripple|spinner).js"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui( {
    themes: {
      light: {
      // ...
      colors: {
      },
    },
      dark: {
      // ...
      colors: {},
    },
    // ... custom themes
  }
})
],
};

export default config;
