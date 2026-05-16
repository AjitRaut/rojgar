import type { Metadata, Viewport } from "next";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rojgar Find - Find Daily Jobs & Hire Local Workers",
    template: "%s | Rojgar Find",
  },
  description:
    "AI-powered platform connecting customers and companies with skilled local workers - plumbers, electricians, carpenters, painters, and daily wage workers. No middlemen, transparent pricing.",
  keywords: [
    "daily jobs",
    "hire workers",
    "local workers",
    "plumber",
    "electrician",
    "carpenter",
    "painter",
    "labor chowk",
    "construction workers",
    "India",
    "Phaltan",
  ],
  authors: [{ name: "Rojgar Find Team" }],
  creator: "Rojgar Find",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Rojgar Find - Daily Jobs & Local Workers",
    description: "Find skilled local workers or daily jobs near you - AI-powered, no middlemen.",
    siteName: "Rojgar Find",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rojgar Find",
    description: "Find skilled local workers or daily jobs near you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
