"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

//just a mock function, will be replaced with actual logic to determine role based access
function determineRoleFromEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!normalized.includes("@") || normalized.endsWith("@")) {
    return "";
  }

  if (normalized.includes("tech") || normalized.includes("technician") || normalized.endsWith("@tech.com")) {
    return "technician";
  }

  return "admin";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const role = determineRoleFromEmail(email);
    if (!role) {
      setError("Please enter a valid email address.");
      return;
    }

    if (role === "technician") {
      router.push("/technician-dashboard");
    } else {
      router.push("/admin-dashboard");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.hero}>
          <span className={styles.heroTag}>Advanced</span>
          <h1 className={styles.title}>Endoscopy and Laparoscopy Equipments</h1>
          <p className={styles.description}>
            At Endovision, we are dedicated to providing healthcare professionals
            across India with top-tier endoscopy-related medical equipments.
          </p>
          <p className={styles.description}>
            Our mission is to empower surgeons, specialists, and medical facilities
            with cutting-edge technology that enhances precision, safety, and
            efficiency in every procedure.
          </p>
          <a href="#" className={styles.contactLink}>
            Contact Us
          </a>
        </div>

        <div className={styles.formArea}>
          <div className={styles.formCard}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className={styles.input}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password*
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className={styles.errorText}>{error}</p> : null}

            <button type="button" className={styles.button} onClick={handleSignIn}>
              Sign In
            </button>
          </div>
        </div>
      </section>
      <a href="#" className={styles.appointmentButton}>
        Book Appointment
      </a>
    </main>
  );
}
