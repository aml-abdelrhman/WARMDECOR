import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const displayFont = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-display",
  display:  "swap",
});

const bodyFont = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-body",
  display:  "swap",
});

const monoFont = JetBrains_Mono({
  subsets:  ["latin"],
  variable: "--font-mono",
  display:  "swap",
  weight:   ["400", "600"],
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  "WARMDECOR — Curated Minimalist Living",
    template: "%s | WARMDECOR",
  },
  description:
    "Elevating your living space with curated minimalist pieces that blend timeless elegance with modern comfort.",
  keywords: ["decor", "interior design", "minimalist", "egypt", "furniture"],
  authors:  [{ name: "WARMDECOR Team" }],
  icons:    { icon: "/favicon.ico" },
  openGraph: {
    type:        "website",
    siteName:    "WARMDECOR",
    title:       "WARMDECOR — Curated Minimalist Living",
    description: "Your one-stop destination for everything you love.",
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} overflow-x-hidden`}
      suppressHydrationWarning={true}
    >
      <body className="font-body bg-surface-secondary text-ink antialiased min-h-screen overflow-x-hidden" suppressHydrationWarning={true}>
        <Providers>
          <Navbar />
          <main className="min-h-[70vh]">
          {children}
          </main>
          <Footer />
        </Providers>

        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background:   "#5C3D23",
              color:        "#f8fafc",
              borderRadius: "12px",
              fontSize:     "13px",
              fontWeight:   "500",
              padding:      "10px 14px",
              boxShadow:    "0 8px 32px 0 rgb(0 0 0 / 0.20)",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#f8fafc" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#f8fafc" },
            },
          }}
        />
      </body>
    </html>
  );
}