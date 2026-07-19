import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS Premium Loyalty",
  description: "Digital membership and loyalty rewards for CS Premium Solutions.",

  manifest: "/manifest.json",

  themeColor: "#C9A84C",

  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CS Premium Loyalty Rewards",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}