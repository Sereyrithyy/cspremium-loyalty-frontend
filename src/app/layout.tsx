import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meridian Rewards — Corporate Gifts Loyalty",
  description: "Digital membership and loyalty rewards for Meridian Corporate Gifts.",
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
