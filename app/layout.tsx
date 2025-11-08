import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { WhatsAppSupport } from "@/components/whatsapp-support";
import { AdminButton } from "@/components/admin-button";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Rulo",
    default: "Rulo",
  },
  description: "Rulo Stream Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="es">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            storageKey="gamehub-theme"
          >
            {/* ✅ Cambiar theme a "dark" para que combine con tu app */}
            <Toaster theme="dark" position="bottom-right" richColors />
            <AdminButton />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}