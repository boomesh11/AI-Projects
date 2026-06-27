import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * Geist Sans — primary UI font.
 * Variable exposed as --font-geist-sans and consumed in globals.css.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Geist Mono — used for code references and timestamps.
 * Variable exposed as --font-geist-mono and consumed in globals.css.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Catalyst Studio",
    template: "%s · Catalyst Studio",
  },
  description:
    "Catalyst Studio — an AI-native business workspace where AI quietly assists while your work stays front and center.",
  keywords: ["workspace", "productivity", "business", "AI", "team"],
  robots: { index: false, follow: false }, // Private app — no indexing
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // Prevents a flash of unstyled content when dark mode is applied
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
