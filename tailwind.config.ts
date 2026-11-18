import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/keep-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'sol': '#ffc93c',
        'celeste': {
          '50': '#eff8ff',
          '100': '#dff0ff',
          '200': '#b8e3ff',
          '300': '#78cdff',
          '400': '#38b6ff',
          '500': '#069af1',
          '600': '#007ace',
          '700': '#0061a7',
          '800': '#02528a',
          '900': '#084572',
          '950': '#062b4b',
      },
      
      }
    },
  },
  plugins: [],
  presets: [require("keep-react/preset")],
};
export default config;
