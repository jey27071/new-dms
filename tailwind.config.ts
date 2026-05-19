import type { Config } from "tailwindcss";

/**
 * SW Design System V2.4 매핑.
 * Tailwind 색상 이름은 기존을 유지하되, 값은 CSS 변수를 참조하여
 * 라이트/다크 모드 토글로 자동 전환되도록 함.
 *
 * 기존 코드의 bg-primary, text-on-surface 등은 그대로 사용 가능.
 * 점진적으로 Component Token (--button-primary-default-bg 등) 직접 활용 권장.
 */
const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Action / Primary ── */
        primary: "var(--color-action-primary-default)",
        "on-primary": "var(--color-action-primary-text)",
        "primary-container": "var(--color-action-primary-hover)",
        "on-primary-container": "var(--color-action-primary-text)",
        "primary-fixed": "var(--color-action-primary-subtle)",
        "primary-fixed-dim": "var(--color-action-primary-subtle)",
        "on-primary-fixed": "var(--color-text-primary)",
        "on-primary-fixed-variant": "var(--color-action-primary-default)",
        "inverse-primary": "var(--color-action-primary-subtle)",
        "surface-tint": "var(--color-action-primary-default)",

        /* ── Surface / bg ── */
        surface: "var(--color-surface-default)",
        "surface-dim": "var(--color-bg-muted)",
        "surface-bright": "var(--color-surface-default)",
        "surface-container-lowest": "var(--color-surface-default)",
        "surface-container-low": "var(--color-bg-subtle)",
        "surface-container": "var(--color-bg-subtle)",
        "surface-container-high": "var(--color-bg-muted)",
        "surface-container-highest": "var(--color-bg-muted)",
        "surface-variant": "var(--color-bg-muted)",
        background: "var(--color-bg-default)",
        "on-background": "var(--color-text-primary)",
        "inverse-surface": "var(--color-text-primary)",
        "inverse-on-surface": "var(--color-surface-default)",

        /* ── Text on surface ── */
        "on-surface": "var(--color-text-primary)",
        "on-surface-variant": "var(--color-text-secondary)",

        /* ── Outline ── */
        outline: "var(--color-icon-default)",
        "outline-variant": "var(--color-border-default)",

        /* ── Secondary / Tertiary (텍스트·아이콘 보조) ── */
        secondary: "var(--color-text-tertiary)",
        "on-secondary": "var(--color-text-inverse)",
        "secondary-container": "var(--color-bg-subtle)",
        "on-secondary-container": "var(--color-text-secondary)",
        "secondary-fixed": "var(--color-bg-muted)",
        "secondary-fixed-dim": "var(--color-bg-muted)",
        "on-secondary-fixed": "var(--color-text-primary)",
        "on-secondary-fixed-variant": "var(--color-text-secondary)",
        tertiary: "var(--color-action-primary-default)",
        "on-tertiary": "var(--color-action-primary-text)",
        "tertiary-container": "var(--color-action-primary-subtle)",
        "on-tertiary-container": "var(--color-action-primary-default)",
        "tertiary-fixed": "var(--color-action-primary-subtle)",
        "tertiary-fixed-dim": "var(--color-action-primary-subtle)",
        "on-tertiary-fixed": "var(--color-action-primary-default)",
        "on-tertiary-fixed-variant": "var(--color-action-primary-default)",

        /* ── Status ── */
        error: "var(--color-status-error)",
        "on-error": "var(--color-text-inverse)",
        "error-container": "var(--color-action-primary-subtle)" /* 옅은 강조 배경 — danger엔 별도 alpha overlay 권장 */,
        "on-error-container": "var(--color-text-danger)",
      },
      borderRadius: {
        DEFAULT: "var(--radius-control-xs)",  /* 2px */
        sm: "var(--radius-control-xs)",       /* 2px */
        lg: "var(--radius-control-sm)",       /* 4px = button-md */
        xl: "var(--radius-modal-md)",         /* 8px = modal-md */
        "2xl": "var(--radius-card-md)",       /* 10px = card-md */
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
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
          "sans-serif",
        ],
      },
      fontSize: {
        h1: ["24px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        h2: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "600" }],
        "body-base": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0em", fontWeight: "500" }],
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;
