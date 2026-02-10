"use client";

import { createTheme } from "@mantine/core";

export const adminTheme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    "var(--font-noto-sans-kr), 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  headings: {
    fontFamily:
      "var(--font-noto-sans-kr), 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "0 1px 3px rgba(0,0,0,0.08)",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
