import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Welfo Admin",
  description: "Internal operations panel for Welfo Fiber Optics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-fg-1">
        {children}
      </body>
    </html>
  );
}
