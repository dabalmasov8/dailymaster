import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientClerkProvider } from "@/components/providers/clerk-provider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DailyMaster - Streamline Your Daily Standups",
  description: "Your FREE daily standup assistant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DailyMaster",
  },
};

export const viewport: Viewport = {
  themeColor: "#E87400",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/pwa-logo-192.png" />
      </head>
      <body className="font-sans antialiased">
        <ClientClerkProvider>{children}</ClientClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
