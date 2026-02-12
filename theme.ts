"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "var(--font-noto-sans-kr), 'Noto Sans KR', sans-serif",
  headings: { fontFamily: "var(--font-noto-sans-kr), 'Noto Sans KR', sans-serif" },
  primaryColor: "newsBlue",
  defaultRadius: "md",

  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
  },

  lineHeights: {
    xs: "1.3",
    sm: "1.45",
    md: "1.55",
    lg: "1.7",
    xl: "1.9",
  },

  other: {
    typography: {
      headline: { fontSize: "clamp(2rem, 2.4vw, 2.9rem)", lineHeight: 1.22, letterSpacing: "-0.02em" },
      mobileHeadline: { fontSize: "clamp(1.5rem, 5vw, 1.9rem)", lineHeight: 1.3, letterSpacing: "-0.02em" },
      subhead: { fontSize: "1.1rem", lineHeight: 1.55 },
      body: { fontSize: "1.08rem", lineHeight: 1.92 },
      mobileBody: { fontSize: "1rem", lineHeight: 1.8 },
      caption: { fontSize: "0.85rem", lineHeight: 1.4 },
      byline: { fontSize: "0.85rem", lineHeight: 1.3, fontWeight: 700 },
    },
  },

  colors: {
    /* ─── Primary brand blues ─── */
    newsBlue: [
      "#eaf3fb",
      "#d5e5f6",
      "#a8caec",
      "#7caee2",
      "#4f92d8",
      "#2779c4",
      "#0f4c81",
      "#0c3f6b",
      "#093155",
      "#07243f",
    ],

    /* ─── Alert / breaking red ─── */
    newsRed: [
      "#fdeeef",
      "#fbdcdf",
      "#f7b8bf",
      "#f3959f",
      "#ee727f",
      "#e84d62",
      "#b91c1c",
      "#941617",
      "#6e1011",
      "#49090b",
    ],

    /* ─── Border (blue-gray dividers & outlines) ─── */
    newsBorder: [
      "#f1f5f9",
      "#e5eaf2",
      "#dfe7f2",
      "#d8e3ee",
      "#d0dce9",
      "#b9c9dc",
      "#a8bed8",
      "#9bb0c8",
      "#7f9ab7",
      "#5f7a96",
    ],

    /* ─── Surface (card / panel backgrounds) ─── */
    newsSurface: [
      "#ffffff",
      "#fcfdff",
      "#f9fbff",
      "#f8fbff",
      "#f7fbff",
      "#f5f9ff",
      "#f4f8fd",
      "#f1f7ff",
      "#eef4fb",
      "#eaf2fc",
    ],

    /* ─── Headline text (near-black) ─── */
    newsHeadline: [
      "#f9fafb",
      "#e5e7eb",
      "#d1d5db",
      "#9ca3af",
      "#6b7280",
      "#4b5563",
      "#374151",
      "#1f2937",
      "#111827",
      "#0f172a",
    ],

    /* ─── Muted (byline, caption, secondary text) ─── */
    newsMuted: [
      "#f8fafc",
      "#e2e8f0",
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#5d7088",
      "#4b5d73",
      "#475569",
      "#334155",
      "#1e293b",
    ],

    /* ─── Accent (link, rank, interactive blue) ─── */
    newsAccent: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e4fa8",
      "#1e3a8a",
    ],

    /* ─── Badge (category badge red-tinted) ─── */
    newsBadge: [
      "#fef2f2",
      "#f8ecec",
      "#e4b8bd",
      "#d4737d",
      "#c75060",
      "#a63d4a",
      "#7d1d27",
      "#6b1520",
      "#5c1018",
      "#4a0c12",
    ],

    /* ─── Lead (summary / blockquote accents) ─── */
    newsLead: [
      "#f8fbff",
      "#f5f8fd",
      "#edf3fa",
      "#cdddf0",
      "#8aa9cf",
      "#88a8cf",
      "#365b87",
      "#385b84",
      "#243647",
      "#1f3b5d",
    ],

    /* ─── Tag (tag pill backgrounds & borders) ─── */
    newsTag: [
      "#f8fbff",
      "#f5f9ff",
      "#f4f8fd",
      "#eaf2fc",
      "#d3dfec",
      "#d2deeb",
      "#4f6179",
      "#4b617b",
      "#516173",
      "#3a4b5f",
    ],

    /* ─── Reporter (avatar and card) ─── */
    newsReporter: [
      "#f7fbff",
      "#eff5fc",
      "#ebf2fa",
      "#cdd8e5",
      "#b8c7d9",
      "#9bb0c8",
      "#334155",
      "#243648",
      "#233548",
      "#1f2937",
    ],

    /* ─── Utility (ad strips, info rows, backdrop) ─── */
    newsUtil: [
      "#f6f9fd",
      "#f6f7f9",
      "#eef4fb",
      "#e6eef8",
      "#d5e0ed",
      "#dde6f1",
      "#6d8098",
      "#5f7288",
      "#41566f",
      "#66788f",
    ],
  },

  breakpoints: {
    xs: "30em",
    sm: "48em",
    md: "64em",
    lg: "74em",
    xl: "90em",
  },

  components: {
    Button: {
      defaultProps: {
        radius: "xl",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
