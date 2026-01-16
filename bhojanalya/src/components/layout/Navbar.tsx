"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../../public/bhojnalaya-text.png";
import { LogOut, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const userName = "Abhishek"; 

  return (
    <nav className="sticky top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-between bg-[#471396] border-b border-white/10 shadow-lg font-sans">
      <div className="hidden md:flex gap-8 text-sm font-bold text-white/70">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => router.push("/")}>
        <Image src={Logo} alt="Logo" width={130} height={35} priority style={{ filter: "brightness(1.2)" }} />
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFCC00] text-[#471396] font-black flex items-center justify-center border-2 border-white/20 group-hover:scale-105 transition-transform">
            {userName.charAt(0).toUpperCase()}
          </div>
          <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4" /> Profile
            </button>
            <button 
              onClick={() => router.push("/auth")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}