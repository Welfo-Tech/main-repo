"use client";
import React from "react";
import Image from "next/image";

const navLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Products", href: "/products" },
  { label: "Technologies", href: "/technologies" },
  { label: "Training & Service", href: "/training" },
  { label: "Resources", href: "/resources" },
  { label: "Contact Us", href: "/contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-100 bg-white border-b border-slate-200 shadow-md">
      <div className="max-w-6xl mx-auto px-8 h-18 flex items-center justify-between gap-8 md:px-4 md:gap-4">
        <a href="/" className="flex-shrink-0 no-underline" aria-label="Welfo Endovision home">
          <Image src="/logo.png" alt="Welfo" width={208} height={56} className="object-contain" priority />
        </a>

        <nav className="flex items-center gap-6 md:gap-4" aria-label="Main navigation">
          <a href="/" className="text-purple-700 flex items-center no-underline transition-colors duration-150 hover:text-violet-900" aria-label="Home">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
            </svg>
          </a>

          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="text-purple-700 text-base font-semibold no-underline bg-none border-none cursor-pointer p-0 font-inherit flex items-center gap-1 whitespace-nowrap transition-colors duration-150 hover:text-violet-900 hover:underline hover:underline-offset-1 md:text-sm"
            >
              {link.label}
            </a>
          ))}

          <a 
            href="/cart" 
            className="text-purple-700 text-base font-semibold no-underline bg-none border-none cursor-pointer p-0 font-inherit flex items-center gap-1 whitespace-nowrap transition-colors duration-150 hover:text-violet-900 hover:underline hover:underline-offset-1 md:text-sm"
          >
            my Cart( 0 )
          </a>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
