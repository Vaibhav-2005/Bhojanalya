"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
// Using your specific import path
import Logo from "../../../public/bhojnalaya-text.png";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- AMBIENT GLOW EFFECTS --- */}
      {/* Top Left Purple Glow */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#471396]/10 blur-[120px] rounded-full pointer-events-none" />
      {/* Bottom Right Yellow Glow */}
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#FFCC00]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-[#471396] transition-colors font-semibold text-sm z-50"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-[950px] min-h-[620px] bg-white rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex border border-gray-100 z-10">
        
        {/* --- LEFT SIDE: LOGIN --- */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-3xl font-black text-[#090040] mb-2 text-center">Login</h2>
            <p className="text-gray-400 mb-8 text-sm font-medium text-center">Access your partner account.</p>
            
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="name@email.com" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Password</label>
                  {/* <button type="button" className="text-[10px] font-bold text-[#471396] hover:underline">Forgot?</button> */}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm" />
                </div>
              </div>

              <button className="w-full py-4 bg-[#471396] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all" onClick={() => router.push("/dashboard")}>
                Log In
              </button>
            </form>
          </div>
        </div>

        {/* --- RIGHT SIDE: ACCOUNT SIGNUP --- */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-[320px] mx-auto w-full">
            <h2 className="text-3xl font-black text-[#090040] mb-2 text-center">Create Account</h2>
            <p className="text-gray-400 mb-8 text-sm font-medium text-center">Step 1: Set up your credentials.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Full Name" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="name@email.com" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#471396] outline-none transition-all text-sm" />
                </div>
              </div>

              <button className="w-full py-4 bg-[#FFCC00] text-[#471396] rounded-xl font-bold text-sm shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={() => router.push("/admin")}>
                Sign Up<ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* --- THE SLIDING LID --- */}
        <motion.div 
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-[#471396] z-40 flex flex-col items-center justify-center p-12 text-center text-white shadow-[0_0_50px_rgba(0,0,0,0.3)]"
        >
          <div className="mb-10">
            <Image 
              src={Logo} 
              alt="Logo" 
              width={200} 
              height={50} 
              style={{ filter: "brightness(1.2) saturate(1.2)" }} 
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold">
              {isLogin ? "New To Bhojanalya" : "Welcome Back"}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-[280px]">
              {isLogin 
                ? "Start your journey by creating an account. Register your restaurant in the next step." 
                : "Manage your menu, track performance, and grow your revenue."}
            </p>
            
            <div className="flex flex-col items-center gap-4">
               <p className="text-xs text-white/50 uppercase tracking-widest font-bold">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
               </p>
               <button 
                onClick={() => setIsLogin(!isLogin)}
                className="px-12 py-3 border-2 border-[#FFCC00] text-[#FFCC00] rounded-full font-bold text-xs hover:bg-[#FFCC00] hover:text-[#471396] transition-all uppercase tracking-widest shadow-xl shadow-black/20"
              >
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