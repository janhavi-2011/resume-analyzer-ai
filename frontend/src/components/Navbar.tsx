// src/components/Navbar.tsx

"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { logoutUser } from "@/api/auth";
import { getPlan } from "@/api/analytics";
import { jwtDecode } from "jwt-decode";
import { PlanInfo } from "@/types";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded: any = jwtDecode(token);
        setUserName(decoded.email || "User");
      } catch {
        setUserName("User");
      }
      getPlan().then(setPlan).catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logoutUser();
  };

  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-800 relative">
      <Link href="/" className="text-xl font-bold tracking-tight">
        ResumeAI
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="text-sm text-gray-400">{userName}</span>
            {plan && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                plan.plan === "pro"
                  ? "bg-purple-900/40 text-purple-300 border border-purple-600"
                  : "bg-gray-800 text-gray-400 border border-gray-600"
              }`}>
                {plan.plan === "pro" ? "PRO" : "FREE"}
              </span>
            )}
            <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm">
              Dashboard
            </Link>
            <Link href="/dashboard/analytics" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm">
              Analytics
            </Link>
            <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">Login</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-2 text-gray-400 hover:text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 flex flex-col gap-3 md:hidden z-50">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-400 px-2">{userName}</span>
              {plan && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                  plan.plan === "pro"
                    ? "bg-purple-900/40 text-purple-300 border border-purple-600"
                    : "bg-gray-800 text-gray-400 border border-gray-600"
                }`}>
                  {plan.plan === "pro" ? "PRO" : "FREE"}
                </span>
              )}
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded text-sm text-center">
                Dashboard
              </Link>
              <Link href="/dashboard/analytics" onClick={() => setMobileOpen(false)} className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded text-sm text-center">
                Analytics
              </Link>
              <button onClick={handleLogout} className="bg-red-600/80 hover:bg-red-600 px-4 py-2.5 rounded text-sm text-center">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded text-sm text-center">Login</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded text-sm text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}