import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skinstric AI",
  description: "Skinstric AI project for Frontend Simplified.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
