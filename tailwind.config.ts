import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#fcf8ff",
        "surface-dim": "#dcd8e5",
        "surface-bright": "#fcf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f2ff",
        "surface-container": "#f0ecf9",
        "surface-container-high": "#eae6f4",
        "surface-container-highest": "#e4e1ee",
        "on-surface": "#1b1b24",
        "on-surface-variant": "#464555",
        "inverse-surface": "#302f39",
        "inverse-on-surface": "#f3effc",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        "surface-tint": "#4d44e3",
        primary: "#3525cd",
        "on-primary": "#ffffff",
        "primary-container": "#4f46e5",
        "on-primary-container": "#dad7ff",
        "inverse-primary": "#c3c0ff",
        secondary: "#5c5f61",
        "on-secondary": "#ffffff",
        "secondary-container": "#e0e3e5",
        "on-secondary-container": "#626567",
        tertiary: "#7e3000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#a44100",
        "on-tertiary-container": "#ffd2be",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e2dfff",
        "primary-fixed-dim": "#c3c0ff",
        "on-primary-fixed": "#0f0069",
        "on-primary-fixed-variant": "#3323cc",
        "secondary-fixed": "#e0e3e5",
        "secondary-fixed-dim": "#c4c7c9",
        "on-secondary-fixed": "#191c1e",
        "on-secondary-fixed-variant": "#444749",
        "tertiary-fixed": "#ffdbcc",
        "tertiary-fixed-dim": "#ffb695",
        "on-tertiary-fixed": "#351000",
        "on-tertiary-fixed-variant": "#7b2f00",
        background: "#fcf8ff",
        "on-background": "#1b1b24",
        "surface-variant": "#e4e1ee"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        full: "9999px"
      },
      spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem"
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif"
        ],
        h1: ["Pretendard Variable", "Pretendard", "sans-serif"],
        h2: ["Pretendard Variable", "Pretendard", "sans-serif"],
        h3: ["Pretendard Variable", "Pretendard", "sans-serif"],
        "body-base": ["Pretendard Variable", "Pretendard", "sans-serif"],
        "body-sm": ["Pretendard Variable", "Pretendard", "sans-serif"],
        "label-caps": ["Pretendard Variable", "Pretendard", "sans-serif"],
        "label-sm": ["Pretendard Variable", "Pretendard", "sans-serif"]
      },
      fontSize: {
        h1: ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "600" }],
        "body-base": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0em", fontWeight: "500" }]
      },
      boxShadow: {
        card: "0px 1px 3px 0px rgba(30, 27, 75, 0.05), 0px 4px 6px -2px rgba(30, 27, 75, 0.03)"
      }
    }
  },
  plugins: []
};

export default config;
