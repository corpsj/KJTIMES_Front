"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "var(--font-noto-sans-kr), 'Noto Sans KR', sans-serif",
  headings: { fontFamily: "var(--font-noto-sans-kr), 'Noto Sans KR', sans-serif" },
  primaryColor: "newsBlue",
  defaultRadius: "md",
  colors: {
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
