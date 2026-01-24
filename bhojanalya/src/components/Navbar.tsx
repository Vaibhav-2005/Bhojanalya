"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import LogoImg from "../../public/bhojnalaya-text.png"; 
import { LogOut, ChevronDown, LayoutDashboard, Store, Settings, Lock, X, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/api"; 

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string>("initiated");

  const isHidden = pathname === "/" || pathname === "/auth" || pathname?.includes("/preview");
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isHidden) {
      const fetchUser = async () => {
        try {
          const storedStatus = localStorage.getItem("approval_status");
          const userData = await apiRequest('/protected/ping');
          setUser(userData);
          setApprovalStatus(storedStatus || "initiated");
        } catch (err) {}
      };
      const handleStorageChange = () => {
         const newStatus = localStorage.getItem("approval_status");
         if (newStatus) setApprovalStatus(newStatus);
      };
      fetchUser();
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("status-update", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("status-update", handleStorageChange);
      };
    }
  }, [isHidden, pathname]);

  const handleEditClick = () => {
    if (approvalStatus === "active" || approvalStatus === "rejected") {
      router.push("/edit");
    } else {
      if (approvalStatus === "pending") {
        setBlockReason("You have already sent the request. Please wait for Admin approval.");
      } else {
        setBlockReason("Please submit the approval request from the Dashboard bottom bar first.");
      }
      setShowBlockPopup(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('approval_status');
    router.push('/auth');
  };

  if (isHidden) return null;

  const displayName = user?.email?.split('@')[0] || (isAdmin ? "Admin" : "Client");
  const displayEmail = user?.email || "user@bhojanalya.com";
  const bgClass = isAdmin ? "bg-gradient-to-br from-[#FFCC00] to-orange-400 text-[#2e0561]" : "bg-[#FFCC00] text-[#471396]";

  return (
    <>
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
                  <button onClick={handleEditClick} className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${pathname === "/edit" ? "text-[#FFCC00]" : "text-white/60 hover:text-white"}`}>
                    {approvalStatus === "active" ? <Settings size={14} /> : <Lock size={14} />} Edit Info
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex items-center" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 py-1.5 px-1.5 pr-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
              <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-inner ${bgClass}`}>{displayName.charAt(0).toUpperCase()}</div>
              {/* UPDATED: Only Name shown here, ID removed */}
              <div className="hidden md:block text-left">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{displayName}</p>
              </div>
              <ChevronDown size={12} className={`text-white/40 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 overflow-hidden origin-top-right">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                  <p className="text-xs font-bold text-[#2e0561] truncate" title={displayEmail}>{displayEmail}</p>
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

      {/* POPUP */}
      {showBlockPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowBlockPopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><Lock size={32} /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{blockReason}</p>
            <button onClick={() => setShowBlockPopup(false)} className="w-full py-3 bg-[#2e0561] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#471396] transition-colors">Understood</button>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all ${active ? "text-[#FFCC00]" : "text-white/60 hover:text-white"}`}>
      {icon} {label}
    </button>
  );
}