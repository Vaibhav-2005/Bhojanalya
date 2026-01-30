"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mail, Lock, User, ArrowRight, 
  AlertTriangle, CheckCircle2, Loader2 
} from "lucide-react";
import Image from "next/image";
import { Outfit } from "next/font/google"; // New high-end font
import Logo from "../../../public/bhojnalaya-text.png";
import { apiRequest } from "@/lib/api";

const outfit = Outfit({ subsets: ["latin"] });

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // --- 1. THE POSITIONING ENGINE ---
  const determineUserFlow = async () => {
    try {
      const res = await apiRequest('/auth/protected/onboarding', 'GET');
      const status = (res.onboarding_status || "null").toUpperCase();
      
      sessionStorage.setItem("nav_intent", "true");

      if (status === "NULL") {
        router.replace("/register");
      } 
      else if (["REGISTERED", "MENU_PENDING", "PHOTO_PENDING"].includes(status)) {
        router.replace("/register"); 
      } 
      else if (status === "BOTH_COMPLETED") {
        router.replace("/deals");
      } 
      else if (["DEALS_COMPLETED", "COMPLETED"].includes(status)) {
        router.replace("/preview");
      } 
      else {
        router.replace("/register");
      }
    } catch (err) {
      console.error("Flow Sync Error:", err);
      setCheckingSession(false);
    }
  };

  // --- 2. SESSION CHECKER ---
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        await apiRequest('/auth/protected/ping');
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        if (payload.role?.toUpperCase() === "ADMIN") {
            sessionStorage.setItem("nav_intent", "true");
            router.replace("/admin");
            return;
        }
        await determineUserFlow();
      } catch (err: any) {
        localStorage.clear();
        setCheckingSession(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  // --- 3. HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCheckingSession(true);

    try {
      const data = await apiRequest('/auth/login', 'POST', {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email || formData.email);
      localStorage.setItem('name', data.name || "Partner");
      
      const payload = JSON.parse(window.atob(data.token.split('.')[1]));
      if (payload.role?.toUpperCase() === "ADMIN") {
        sessionStorage.setItem("nav_intent", "true");
        router.push("/admin");
        return;
      }

      await determineUserFlow();
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
      setCheckingSession(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await apiRequest('/auth/register', 'POST', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // IMMEDIATE SWITCH LOGIC
      setSuccess("Account ready! Please login below.");
      setIsLogin(true); // Switches immediately to login side
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    }
  };

  if (checkingSession) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 ${outfit.className}`}>
        <Loader2 className="animate-spin text-[#471396] w-12 h-12"/>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Positioning Journey...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden ${outfit.className}`}>
      
      {/* Background Blurs */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#471396]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#FFCC00]/10 blur-[120px] rounded-full pointer-events-none" />

      <button onClick={() => router.push("/")} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-[#471396] transition-colors font-bold text-xs z-50 uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="relative w-full max-w-[950px] min-h-[620px] bg-white rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex border border-slate-100 z-10">
        
        {/* LOGIN SECTION */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-4xl font-black text-[#2e0561] mb-2 text-center tracking-tighter">Login</h2>
            <p className="text-slate-400 mb-8 text-sm font-semibold text-center uppercase tracking-widest">Manage Establishment</p>
            
            <form className="space-y-5" onSubmit={handleLogin}>
              <AnimatePresence mode="wait">
                {error && isLogin && (
                  <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[10px] font-black border border-red-100 uppercase tracking-wide">
                    <AlertTriangle size={14} /> {error}
                  </motion.div>
                )}
                {/* SUCCESS NOTIFICATION RENDERED HERE FOR BOTH LOGIN & POST-REGISTER */}
                {success && isLogin && (
                  <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-3 rounded-2xl text-[10px] font-black border border-green-100 uppercase tracking-wide">
                    <CheckCircle2 size={14} /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="name@email.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 text-slate-700 font-bold border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#471396] outline-none text-sm transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-4 bg-slate-50 text-slate-700 font-bold border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#471396] outline-none text-sm transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full py-4.5 bg-[#471396] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all hover:bg-[#3b0d82]">Sign In</button>
            </form>
          </div>
        </div>

        {/* REGISTER SECTION */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-4xl font-black text-[#2e0561] mb-2 text-center tracking-tighter">Register</h2>
            <p className="text-slate-400 mb-8 text-sm font-semibold text-center uppercase tracking-widest">Join Network</p>
            <form className="space-y-4" onSubmit={handleRegister}>
              <AnimatePresence mode="wait">
                {error && !isLogin && (
                  <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[10px] font-black border border-red-100 uppercase tracking-wide">
                    <AlertTriangle size={14} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Owner Name" className="w-full pl-11 pr-4 py-4 bg-slate-50 text-slate-700 font-bold border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#471396] outline-none text-sm transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="name@email.com" className="w-full pl-11 pr-4 py-4 bg-slate-50 text-slate-700 font-bold border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#471396] outline-none text-sm transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-4 bg-slate-50 text-slate-700 font-bold border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#471396] outline-none text-sm transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full py-4.5 bg-[#FFCC00] text-[#2e0561] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-[#e6b800]">
                Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* OVERLAY SLIDER */}
        <motion.div 
          animate={{ x: isLogin ? "100%" : "0%" }} 
          transition={{ type: "spring", stiffness: 80, damping: 18 }} 
          className="absolute top-0 left-0 w-1/2 h-full bg-[#471396] z-40 flex flex-col items-center justify-center p-12 text-center text-white shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          <div className="mb-10 scale-110">
            <Image src={Logo} alt="Logo" width={220} height={60} style={{ filter: "brightness(1.2) saturate(1.2)" }} />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tighter">{isLogin ? "New To Bhojanalya?" : "Welcome Back!"}</h3>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[280px]">
              {isLogin ? "Start your journey by creating a partner account." : "Access your dashboard to manage your menu."}
            </p>
            <button 
              onClick={() => {setIsLogin(!isLogin); setError(null); setSuccess(null);}} 
              className="px-12 py-3.5 border-2 border-[#FFCC00] text-[#FFCC00] rounded-full font-black text-[10px] hover:bg-[#FFCC00] hover:text-[#471396] transition-all uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95"
            >
              {isLogin ? "Create Account" : "Login Instead"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}