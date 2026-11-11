import { MapPin, Phone, Mail } from "lucide-react";
export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-grid">

          {/* Contact Us */}
          <div className="footer-col">
            <h3>Contact Us</h3>

            <div className="contact-box">
              <MapPin size={18} />
              <span>
                Forest Road Industrial Area<br />
                Dhalwala Rishikesh<br />
                Uttarakhand India
              </span>
            </div>

            <div className="contact-box">
              <Phone size={18} />
              <a href="tel:+919557870167">
                 +91 9557870167
            </a>
            </div>

            <div className="contact-box">
              <Mail size={18} />
              <a href="mailto:welfofiber86@gmail.com">
                    welfofiber86@gmail.com
                </a>
            </div>

            <div className="social-row">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.6C16.6 3.5 15.6 3.4 14.5 3.4c-2.4 0-4 1.4-4 4.1v2.4H8v3.1h2.5V21h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.4 5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM21 7.2c-.1-1.3-.4-2.4-1.3-3.3-.9-.9-2-1.2-3.3-1.3C15.1 2.5 8.9 2.5 7.6 2.6c-1.3.1-2.4.4-3.3 1.3C3.4 4.8 3.1 5.9 3 7.2 2.9 8.5 2.9 14.7 3 16c.1 1.3.4 2.4 1.3 3.3.9.9 2 1.2 3.3 1.3 1.3.1 7.5.1 8.8 0 1.3-.1 2.4-.4 3.3-1.3.9-.9 1.2-2 1.3-3.3.1-1.3.1-7.5 0-8.8zM19 16c-.1 1-.3 1.7-.6 2.1-.4.4-1.1.6-2.1.6-1.3.1-7.3.1-8.6 0-1-.1-1.7-.3-2.1-.6-.4-.4-.6-1.1-.6-2.1-.1-1.3-.1-7.3 0-8.6.1-1 .3-1.7.6-2.1.4-.4 1.1-.6 2.1-.6 1.3-.1 7.3-.1 8.6 0 1 .1 1.7.3 2.1.6.4.4.6 1.1.6 2.1.1 1.3.1 7.3 0 8.6z" />
                </svg>
              </a>
              <a href="#" aria-label="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 3H22l-7.6 8.7L23 21h-6.9l-5.4-6.6L4.4 21H1.3l8.1-9.3L1 3h7l4.9 6.1L18.9 3zm-1.2 16h1.9L7.4 5H5.4l12.3 14z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 8.6c0-1.7-1.3-3-3-3.1-2.5-.1-4.9-.2-7-.2s-4.5.1-7 .2c-1.7.1-3 1.4-3 3.1C1.9 9.9 1.8 11 1.8 12s.1 2.1.2 3.4c0 1.7 1.3 3 3 3.1 2.5.1 4.9.2 7 .2s4.5-.1 7-.2c1.7-.1 3-1.4 3-3.1.1-1.3.2-2.4.2-3.4s-.1-2.1-.2-3.4zM10 15V9l5.5 3-5.5 3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <a className="link-item" href="#">Home</a>
            <a className="link-item" href="#">About Us</a>
            <a className="link-item" href="#">Technologies</a>
            <a className="link-item" href="#">Training &amp; Service</a>
            <a className="link-item" href="#">Gallery</a>
            <a className="link-item" href="#">Resources</a>
            <a className="link-item" href="#">Contact Us</a>
          </div>

          {/* Our Products */}
          <div className="footer-col">
            <h3>Our Products</h3>
            <a className="link-item" href="#">Cystoscope</a>
            <a className="link-item" href="#">Laparoscope</a>
            <a className="link-item" href="#">Sinuscope</a>
            <a className="link-item" href="#">Connectors</a>
          </div>

          {/* Our Policy */}
          <div className="footer-col">
            <h3>Our Policy</h3>
            <a className="link-item" href="#">Shipping Policy</a>
            <a className="link-item" href="#">Terms and Conditions</a>
            <a className="link-item" href="#">Refund and Cancellation Policy</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 All Rights Reserved By <strong>Endovision</strong></p>
          <p className="maintainer">Developed and maintained by <strong>Welfo Endovision.</strong></p>
        </div>
      </footer>

      <a className="whatsapp-btn" href="https://wa.me/919557870167" aria-label="WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1112 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7 1-.1.2-.3.2-.5.1-1.3-.6-2.1-1.1-3-2.5-.2-.3.2-.3.6-1 .1-.2 0-.4 0-.5-.1-.1-.5-1.3-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z" />
        </svg>
      </a>

      <style>{`
        .site-footer {
          position: relative;
          background: linear-gradient(160deg, #3a2178 0%, #2c1560 60%, #24104f 100%);
          color: #fff;
          padding: 60px 60px 0;
          overflow: hidden;
          font-family: 'Segoe UI', Arial, sans-serif;
        }

        .site-footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #7ee787, #2ecc71);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .footer-col h3 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 10px;
        }

        .footer-col h3::after {
          content: "";
          display: block;
          width: 46px;
          height: 3px;
          background: #fff;
          margin-top: 10px;
        }

        .contact-box,
        .link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          padding: 14px 18px;
          margin-top: 18px;
          font-size: 15px;
          line-height: 1.5;
        }

        .contact-box svg {
          flex-shrink: 0;
          opacity: 0.9;
        }

        .link-item {
          display: block;
          color: #fff;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .link-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fff;
        }

        .social-row {
          display: flex;
          gap: 14px;
          margin-top: 18px;
        }

        .social-row a {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .social-row a:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .footer-bottom {
          margin-top: 50px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px 0;
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
        }

        .footer-bottom strong {
          color: #fff;
        }

        .footer-bottom .maintainer {
          font-style: italic;
        }

        .footer-bottom p {
          margin: 4px 0;
        }

        .whatsapp-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
          color: #fff;
          text-decoration: none;
          z-index: 999;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .site-footer {
            padding: 40px 24px 0;
          }
        }
      `}</style>
    </>
  );
}