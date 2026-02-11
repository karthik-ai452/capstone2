"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, light } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function ClerkThemeProvider({ children }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : light,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
