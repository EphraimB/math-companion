import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Companion - Interactive Algebra 2 Whiteboard Tutor",
  description: "An advanced, interactive math learning dashboard featuring pressure-sensitive whiteboard drawing, air-writing webcam hand-tracking, and offline image OCR.",
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
