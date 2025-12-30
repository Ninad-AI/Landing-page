import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ninad AI - Real-Time AI Voice That Feels Human",
  description:
    "Low-latency, expressive speech for apps, agents, and experiences ready to integrate in minutes. Experience the next evolution in voice AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anonymous+Pro&family=IBM+Plex+Mono:wght@300;400&family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800&family=Roboto:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
