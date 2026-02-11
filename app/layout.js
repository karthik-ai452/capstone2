import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import ClerkThemeProvider from "@/components/clerk-theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            <Header />

            <main className="min-h-screen bg-background text-foreground">
              {children}
            </main>

            <Toaster richColors />
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
