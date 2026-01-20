"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import LogoImg from "../../../public/bhojnalaya-text.png";
import { LogOut, ChevronDown, User } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userEmail = "admin@bhojanalya.com"; 
  const userName = "User";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // --- NEW: Hide Navbar logic ---
  // If we are on the preview page, do not render the Navbar
  if (pathname === "/preview") return null;

  return (
    <nav className="w-full bg-[#471396] border-b border-white/5 sticky top-0 z-[100]">
      <div className="max-w-6xl mx-auto h-20 px-12 flex items-center justify-between relative">
        
        {/* Left: Navigation Links */}
        <div className="flex items-center gap-10">
          <button 
            onClick={() => router.push("/dashboard")} 
            className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all ${pathname === "/dashboard" ? "text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Dashboard
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <Image src={LogoImg} alt="Bhojnalaya" width={110} height={28} priority />
        </div>

        {/* Right: User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 py-1 px-1 pr-3 rounded-full hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-full bg-[#FFCC00] text-[#471396] font-bold flex items-center justify-center text-[10px]">
              {userName.charAt(0)}
            </div>
            <ChevronDown size={12} className={`text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 overflow-hidden">
              
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                <p className="text-xs font-bold text-[#471396] truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>

              <div className="py-2">
                <button onClick={() => router.push("/auth")} className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={14} /> 
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}