import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/auth/AuthContext"
import { RefreshProvider } from "@/contexts/RefreshContext"


export const metadata: Metadata = {
  title: "Bookings Management",
  description: "Safari bookings management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <AuthProvider>
          <RefreshProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </RefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
