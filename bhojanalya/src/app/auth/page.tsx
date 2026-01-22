"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, ShieldCheck, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import Logo from "../../../public/bhojnalaya-text.png";
import { apiRequest } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  
  // States
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // 1. AUTH GUARD: Redirect if already logged in
  // (We don't need to check for duplicate tabs here, layout.tsx does that)
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decode token to find role
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);
        const role = (decodedToken.role || "").toUpperCase();

        // Redirect based on role
        if (role === "ADMIN") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
        return; 

      } catch (e) {
        // Token invalid/corrupt - clear it and show login
        localStorage.removeItem('token');
        setCheckingSession(false);
      }
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiRequest('/auth/login', 'POST', {
        email: formData.email,
        password: formData.password
      });

      const token = data.token;
      if (!token) throw new Error("No token received from server");
      localStorage.setItem('token', token);

      // Manual Decode for Role
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decodedToken = JSON.parse(jsonPayload);
      const role = (decodedToken.role || "").toUpperCase();

      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest('/auth/register', 'POST', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setIsLogin(true);
      setError(null);
      alert("Registration Successful! Please Login.");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
    }
  };

  // Show loader while checking if user is already logged in
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#471396]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#471396]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#FFCC00]/10 blur-[120px] rounded-full pointer-events-none" />

      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-[#471396] transition-colors font-semibold text-sm z-50"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="relative w-full max-w-[950px] min-h-[620px] bg-white rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex border border-slate-100 z-10">
        
        {/* --- LOGIN SIDE --- */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-3xl font-black text-[#2e0561] mb-2 text-center">Login</h2>
            <p className="text-slate-400 mb-8 text-sm font-medium text-center">Access your partner account.</p>
            
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && isLogin && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="name@email.com" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm placeholder:text-gray-400 placeholder:font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm placeholder:text-gray-400 placeholder:font-medium" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-[#471396] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all">
                Log In
              </button>
            </form>
          </div>
        </div>

        {/* --- SIGNUP SIDE --- */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-3xl font-black text-[#2e0561] mb-2 text-center">Create Account</h2>
            <p className="text-slate-400 mb-8 text-sm font-medium text-center">Step 1: Set up your credentials.</p>
            
            <form className="space-y-4" onSubmit={handleRegister}>
              {error && !isLogin && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="name" 
                    type="text" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Full Name" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm placeholder:text-gray-400 placeholder:font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="name@email.com" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm placeholder:text-gray-400 placeholder:font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm placeholder:text-gray-400 placeholder:font-medium" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-[#FFCC00] text-[#2e0561] rounded-xl font-bold text-sm shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Sign Up<ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* --- SLIDING LID --- */}
        <motion.div 
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-[#471396] z-40 flex flex-col items-center justify-center p-12 text-center text-white shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          <div className="mb-10">
            <Image src={Logo} alt="Logo" width={200} height={50} style={{ filter: "brightness(1.2) saturate(1.2)" }} />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">{isLogin ? "New To Bhojanalya" : "Welcome Back"}</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">
              {isLogin ? "Start your journey by creating an account." : "Manage your menu and track performance."}
            </p>
            <div className="flex flex-col items-center gap-4">
               <p className="text-xs text-white/50 uppercase tracking-widest font-bold">
                 {isLogin ? "Don't have an account?" : "Already have an account?"}
               </p>
               <button onClick={() => {setIsLogin(!isLogin); setError(null);}} className="px-12 py-3 border-2 border-[#FFCC00] text-[#FFCC00] rounded-full font-bold text-xs hover:bg-[#FFCC00] hover:text-[#471396] transition-all uppercase tracking-widest shadow-xl shadow-black/20">
                {isLogin ? "Sign Up here" : "Login here"}
              </button>
            </div>
          </div>
          <div className="absolute bottom-10 flex items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-[#FFCC00]" />
            <span>Secure Partner Access</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}