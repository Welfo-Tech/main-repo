import type { Metadata } from "next";
import "./globals.css";
import Footer from "@repo/ui/Footer";

export const metadata: Metadata = {
  title: "Welfo Fiber Optics",
  description: "Medical fiber optics, endoscopy systems, and surgical illumination",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
