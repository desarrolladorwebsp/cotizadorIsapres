/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        "surface-hover": "hsl(var(--surface-hover))",

        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          muted: "hsl(var(--brand-muted))",
        },
        action: {
          DEFAULT: "hsl(var(--action))",
          foreground: "hsl(var(--action-foreground))",
          hover: "hsl(var(--action-hover))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
          muted: "hsl(var(--highlight-muted))",
        },
        coverage: {
          hospital: "hsl(var(--coverage-hospital))",
          ambulatory: "hsl(var(--coverage-ambulatory))",
        },

        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "0 12px 40px -28px hsl(var(--foreground) / 0.1)",
        "card-hover": "0 16px 48px -24px hsl(var(--foreground) / 0.12)",
      },
    },
  },
};

export default config;
