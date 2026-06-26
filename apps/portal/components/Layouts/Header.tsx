"use client";

import styles from "./Header.module.css";

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
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logoArea} aria-label="Welfo Endovision home">
          <div className={styles.logoPlaceholder} />
        </a>

        <nav className={styles.nav} aria-label="Main navigation">
          <a href="/" className={styles.homeIcon} aria-label="Home">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7A1 1 0 003 11h1v6a1 1 0 001 1h4v-4h2v4h4a1 1 0 001-1v-6h1a1 1 0 00.707-1.707l-7-7z" />
            </svg>
          </a>

          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}

          <a href="/cart" className={styles.navLink}>
            my Cart( 0 )
          </a>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader;
