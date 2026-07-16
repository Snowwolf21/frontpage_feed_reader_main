import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🌐 Production Environment Domain Fallback
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snowwolfrssfeed.vercel.app";

// 🎨 Viewport & Theme Optimization (Separated in Next.js 14+)
export const viewport: Viewport = {
  themeColor: "#09090b", 
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// 📈 Enterprise SaaS Metadata Engine
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Frontpage | All Your News In One Beautiful Place",
    template: "%s | Frontpage"
  },
  description: "Frontpage unifies your essential RSS, Atom, and JSON data endpoints into a lightning-fast, cryptographic, distraction-free reading workspace. Engineered for modern knowledge workers.",
  keywords: [
    "RSS Reader", 
    "Atom Feed Explorer", 
    "News Aggregator", 
    "Developer Workspace", 
    "Knowledge Management", 
    "Privacy First Reader"
  ],
  authors: [{ name: "Frontpage Engineering", url: siteUrl }],
  creator: "Frontpage Labs",
  publisher: "Frontpage Inc.",
  
  // ⚙️ Search Engine Robots Configuration
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 🌍 Open Graph Social Graph Controls (LinkedIn, Slack, Facebook)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Frontpage | Premium Data & RSS Feed Engine",
    description: "Amalgamate your data endpoints into a clean, tracking-free reader dashboard. Unified, ultra-fast, and custom built.",
    siteName: "Frontpage",
    images: [
      {
        url: "/og-image.png", // Ensure this file exists in your public/ directory
        width: 1200,
        height: 630,
        alt: "Frontpage Application Dashboard Interface Mockup",
      },
    ],
  },

  // 🐦 Twitter Card Architecture
  twitter: {
    card: "summary_large_image",
    title: "Frontpage | Secure RSS Feed Engine",
    description: "Architect perfect feed timelines with no telemetry, zero ads, and edge-synchronized offline reading.",
    creator: "@frontpage_dev",
    images: ["/og-image.png"],
  },

  // 📱 Device Asset Link Tokens
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // 🔗 Dynamic Sitemap Self-Reference Canvas
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-zinc-950 text-zinc-50`}>
        {children}
      </body>
    </html>
  );
}