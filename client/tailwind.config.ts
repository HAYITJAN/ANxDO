import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "#1a1824",
        ink: "#13131a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "min(88rem,calc(100vw-1.5rem))",
        /** Bosh sahifa / header yon padding bilan tor emas */
        shell: "min(1920px,100%)",
      },
      boxShadow: {
        card: "0 12px 40px -12px rgba(0,0,0,0.65)",
        "card-hover": "0 20px 50px -15px rgba(139,92,246,0.25)",
      },
      keyframes: {
        "ad-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "ad-fade": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ad-soft-pulse": {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
        "ad-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ad-dock-glow": {
          "0%, 100%": {
            boxShadow:
              "inset 0 1px 0 0 rgba(192,132,252,0.15), 0 -4px 28px -6px rgba(88,28,135,0.45)",
          },
          "50%": {
            boxShadow:
              "inset 0 1px 0 0 rgba(232,121,249,0.25), 0 -8px 40px -4px rgba(147,51,234,0.35)",
          },
        },
        /** Pastki lenta: 3D matn — yengil suzilish + chanoq */
        "ad-3d-marquee-text": {
          "0%, 100%": { transform: "translateY(0) scale(1) rotateX(0deg)" },
          "35%": { transform: "translateY(-2px) scale(1.06) rotateX(6deg)" },
          "70%": { transform: "translateY(1px) scale(1.03) rotateX(-4deg)" },
        },
        /** Gradient matn: siljish + 3D soyalar (bir animatsiyada) */
        "ad-3d-marquee-shine": {
          "0%, 100%": {
            backgroundPosition: "0% 40%",
            filter:
              "drop-shadow(0 1px 0 rgb(124,58,237)) drop-shadow(0 3px 0 rgb(91,33,182)) drop-shadow(0 5px 10px rgba(0,0,0,0.85)) drop-shadow(0 0 16px rgba(192,132,252,0.4)) brightness(1)",
          },
          "50%": {
            backgroundPosition: "100% 60%",
            filter:
              "drop-shadow(0 1px 0 rgb(196,181,253)) drop-shadow(0 4px 0 rgb(109,40,217)) drop-shadow(0 7px 18px rgba(0,0,0,0.88)) drop-shadow(0 0 26px rgba(232,121,249,0.6)) brightness(1.15)",
          },
        },
      },
      animation: {
        "ad-shimmer": "ad-shimmer 7s ease-in-out infinite",
        "ad-fade": "ad-fade 0.55s ease-out forwards",
        "ad-marquee": "ad-marquee 38s linear infinite",
        "ad-dock-glow": "ad-dock-glow 2.8s ease-in-out infinite",
        "ad-soft-pulse": "ad-soft-pulse 3s ease-in-out infinite",
        "ad-3d-marquee-text": "ad-3d-marquee-text 2.6s ease-in-out infinite",
        "ad-3d-marquee-shine": "ad-3d-marquee-shine 4.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
