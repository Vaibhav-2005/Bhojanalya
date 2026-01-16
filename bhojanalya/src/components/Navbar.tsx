"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../public/bhojnalaya-text.png";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-between bg-[#471396] border-b border-white/10 shadow-xl">
      {/* Centered Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => router.push("/")}>
        <Image src={Logo} alt="Bhojanalya Logo" width={140} height={40} priority />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-white/80">
        <Link href="/dashboard" className="hover:text-yellow-400 transition">Dashboard</Link>
        <Link href="/restaurants" className="hover:text-yellow-400 transition">Restaurants</Link>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => router.push("/auth")}
        className="px-6 py-2 rounded-lg bg-white text-[#471396] font-bold hover:bg-yellow-400 transition-colors text-sm"
      >
        Account
      </button>
    </nav>
  );
}