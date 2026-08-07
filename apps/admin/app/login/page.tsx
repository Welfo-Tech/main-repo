"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error || "Unable to sign in.");
        return;
      }

      localStorage.setItem("accessToken", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
      localStorage.setItem("user", JSON.stringify(payload.user));

      if (payload.user.role === "TECHNICIAN") {
        router.push("/technician-dashboard");
      } else {
        router.push("/admin-dashboard");
      }
    } catch {
      setError("Unable to sign in right now.");
    }
  };

  return (
    <main className="relative min-h-[calc(100vh_-_72px)] flex justify-center items-center px-[70px] py-[60px] overflow-hidden bg-[linear-gradient(135deg,_#0a3560_0%,_#0F4C81_45%,_#1a6aab_100%)] max-[900px]:px-[25px] max-[900px]:py-[40px] max-[600px]:px-[18px] max-[600px]:py-[30px]">
      <section className="w-full max-w-[1400px] grid grid-cols-[1.15fr_0.85fr] gap-[70px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[50px] max-[1200px]:gap-[50px]">
        
        <div className="text-white max-[900px]:text-center">
          <span className="inline-block text-white text-[20px] font-medium mb-[18px]">Advanced</span>
          <h1 className="text-[74px] font-[800] leading-[0.95] text-white mb-[32px] max-[1200px]:text-[60px] max-[600px]:text-[42px] max-[600px]:leading-[1.05]">
            Endoscopy and Laparoscopy Equipments
          </h1>
          <p className="text-[20px] leading-[1.7] text-white text-opacity-95 max-w-[620px] mb-[24px] max-[1200px]:text-[18px] max-[900px]:max-w-full max-[600px]:text-[16px]">
            At Endovision, we are dedicated to providing healthcare professionals
            across India with top-tier endoscopy-related medical equipments.
          </p>
          <p className="text-[20px] leading-[1.7] text-white text-opacity-95 max-w-[620px] mb-[24px] max-[1200px]:text-[18px] max-[900px]:max-w-full max-[600px]:text-[16px]">
            Our mission is to empower surgeons, specialists, and medical facilities
            with cutting-edge technology that enhances precision, safety, and
            efficiency in every procedure.
          </p>
          <a href="#" className="inline-block mt-[10px] text-white text-[20px] font-medium no-underline max-[900px]:mx-auto">
            Contact Us
          </a>
        </div>

        <div className="flex justify-start items-center max-[900px]:justify-center">
          <div className="w-full max-w-[470px]">
            <div className="mb-[18px]">
              <label htmlFor="email" className="block text-[rgba(255,255,255,0.95)] text-[16px] mb-[12px]">
                Email*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="w-full h-[58px] px-[20px] rounded-[12px] border border-white/45 bg-transparent text-white text-[17px] outline-none placeholder-white/95 max-[600px]:h-[54px] max-[600px]:text-[16px]"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="mb-[18px]">
              <label htmlFor="password" className="block text-[rgba(255,255,255,0.95)] text-[16px] mb-[12px]">
                Password*
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                className="w-full h-[58px] px-[20px] rounded-[12px] border border-white/45 bg-transparent text-white text-[17px] outline-none placeholder-white/95 max-[600px]:h-[54px] max-[600px]:text-[16px]"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-[#ffb3b3] text-[14px] mb-[14px]">{error}</p> : null}

            <button
              type="button"
              className="w-[200px] h-[58px] rounded-[12px] border-0 bg-[#0F4C81] text-white text-[18px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#0a3560] hover:-translate-y-0.5 max-[600px]:w-full"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
      <a
        href="#"
        className="fixed right-0 top-1/2 -translate-y-1/2 no-underline text-white bg-[#0F4C81] px-[18px] py-[16px] text-[18px] font-medium rounded-l-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-colors duration-200 hover:bg-[#0a3560] [writing-mode:vertical-rl] [text-orientation:mixed] max-[900px]:top-auto max-[900px]:bottom-[20px] max-[900px]:right-[20px] max-[900px]:translate-y-0 max-[900px]:rounded-[8px] max-[900px]:py-[14px] max-[900px]:px-[24px] max-[900px]:[writing-mode:horizontal-tb]"
      >
        Book Appointment
      </a>
    </main>
  );
}
