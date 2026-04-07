import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "Ninad AI - Real-Time AI Voice That Feels Human",
  description:
    "Low-latency, expressive speech for apps, agents, and experiences ready to integrate in minutes. Experience the next evolution in voice AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05030b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/hero-orb.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anonymous+Pro&family=IBM+Plex+Mono:wght@300;400&family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800&family=Roboto:wght@300;400;700&family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4QKDPLWJ8V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4QKDPLWJ8V');
          `}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
