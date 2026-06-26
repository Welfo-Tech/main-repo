import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {/* <SiteHeader /> */}
        {children}
      </body>
    </html>
  );
}
