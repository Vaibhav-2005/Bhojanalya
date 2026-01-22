"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import LogoImg from "../../public/bhojnalaya-text.png"; 
import { LogOut, ChevronDown, LayoutDashboard, Store, Settings, Lock } from "lucide-react";
import { apiRequest } from "@/lib/api"; 

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isHidden = pathname === "/" || pathname === "/auth" || pathname?.includes("/preview");
  const isAdmin = pathname?.startsWith("/admin");

  // We removed the specific 'user.isRegistered === true' check because your API might not be sending it.
  const isRegistered = !loading && !!user; 

  useEffect(() => {
    if (!isHidden) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const userData = await apiRequest('/protected/ping');
            console.log("Navbar User Data:", userData); // 🔍 Debug Log
            setUser(userData);
          }
        } catch (err) {
            console.error("Navbar fetch error", err);
        } finally {
            setLoading(false);
        }
      };
      fetchUser();
    }
  }, [isHidden, pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  const displayName = user?.email?.split('@')[0] || (isAdmin ? "Admin" : "Client");
  const displayEmail = user?.email || "Loading...";
  const displayId = user?.id || "---";
  const initial = displayName.charAt(0).toUpperCase();
  const bgClass = isAdmin ? "bg-gradient-to-br from-[#FFCC00] to-orange-400 text-[#2e0561]" : "bg-[#FFCC00] text-[#471396]";

  if (isHidden) return null;

  return (
    <nav className="w-full bg-[#2e0561] border-b border-white/5 sticky top-0 z-[100] shadow-lg shadow-purple-900/20">
      <div className="max-w-7xl mx-auto h-20 px-8 flex items-center justify-between relative">
        <div className="flex items-center gap-10 h-full">
          <div className="cursor-pointer flex items-center justify-center h-full" onClick={() => router.push(isAdmin ? "/admin" : "/dashboard")}>
             <Image src={LogoImg} alt="Bhojanalya" width={150} height={40} priority className="object-contain w-auto h-8 md:h-10" />
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <div className="flex items-center gap-8">
            {isAdmin ? (
              <>
                <NavLink active={pathname === "/admin"} onClick={() => router.push("/admin")} icon={<LayoutDashboard size={14} />} label="Approvals" />
                <NavLink active={pathname === "/admin/restaurants"} onClick={() => router.push("/admin/restaurants")} icon={<Store size={14} />} label="Restaurants" />
              </>
            ) : (
              <>
                <NavLink active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")} icon={<LayoutDashboard size={14} />} label="Dashboard" />
                
                {/* ✅ VISIBILITY FIX: Button is enabled if 'isRegistered' (user exists) is true */}
                <NavLink 
                  active={pathname === "/edit"} 
                  onClick={() => isRegistered && router.push("/edit")} 
                  icon={isRegistered ? <Settings size={14} /> : <Lock size={14} />} 
                  label="Edit Info"
                  disabled={!isRegistered} 
                />
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-center" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 py-1.5 px-1.5 pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-inner ${bgClass}`}>{initial}</div>
            <div className="hidden md:block text-left">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{displayName}</p>
                <p className="text-[9px] text-white/50 leading-none mt-1">ID: {displayId.substring(0, 8)}...</p>
            </div>
            <ChevronDown size={12} className={`text-white/40 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
          {isOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 overflow-hidden origin-top-right">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                <p className="text-xs font-bold text-[#2e0561] truncate" title={displayEmail}>{displayEmail}</p>
              </div>
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">User ID</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{displayId}</span>
                </div>
              </div>
              <div className="p-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ active, onClick, icon, label, disabled }: any) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/30 cursor-not-allowed group relative select-none">
        {icon} {label}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Loading...
        </div>
      </div>
    );
  }
  return (
    <button onClick={onClick} className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${active ? "text-[#FFCC00]" : "text-white/60 hover:text-white"}`}>
      {icon} {label}
    </button>
  );
}