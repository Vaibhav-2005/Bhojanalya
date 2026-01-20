"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Logo from "../../public/bhojnalaya-text.png";
import {
  Zap,
  Globe,
  PieChart,
  Users,
  ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();

  // --- LOGO SCROLL LOGIC ---
  const logoScale = useTransform(scrollY, [0, 300], [2.5, 0.45]);
  const logoTop = useTransform(scrollY, [0, 300], ["22%", "2.5rem"]);
  const logoLeft = useTransform(scrollY, [0, 300], ["44%", "9rem"]);

  // --- UI SCROLL LOGIC ---
  const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const cornerScale = useTransform(scrollY, [0, 200], [1, 1.15]);
  const navBgOpacity = useTransform(scrollY, [250, 300], [0, 1]);

  return (
    <div className="relative min-h-screen bg-white font-sans selection:bg-[#FFCC00] selection:text-[#2e0561]">

      {/* --- STICKY NAV --- */}
      <motion.nav
        style={{ 
          backgroundColor: "#471396", 
          opacity: navBgOpacity,
          backdropFilter: "blur(10px)" 
        }}
        className="fixed top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/10 shadow-xl pointer-events-none"
      >
        <div className="w-24 hidden md:block" />
        <div className="flex-1" />
        <button
          onClick={() => router.push("/auth")}
          className="px-5 py-2 rounded-full bg-[#FFCC00] text-[#471396] font-bold hover:bg-white hover:shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all duration-300 text-sm pointer-events-auto border border-white/20"
        >
          Login / SignUp
        </button>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center bg-[#2e0561] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0561] via-[#2e0561] to-[#1a033a] opacity-90" />
        
        {/* --- YELLOW CORNERS --- */}
        <motion.div
          style={{ opacity: heroContentOpacity, scale: cornerScale }}
          className="absolute inset-0 pointer-events-none z-10"
        >
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
             className="w-full h-full relative"
           >
              {/* UPDATED: top-3 (12px) provides a balanced 'frame' look without touching the edge */}
              <div className="absolute top-10 left-10 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-l-[8px] border-[#FFCC00]" />
              <div className="absolute top-10 right-10 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-r-[8px] border-[#FFCC00]" />
              <div className="absolute bottom-10 left-10 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-l-[8px] border-[#FFCC00]" />
              <div className="absolute bottom-10 right-10 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-r-[8px] border-[#FFCC00]" />
           </motion.div>
        </motion.div>

        {/* --- LOGO CONTAINER --- */}
        <div className="absolute inset-0 pointer-events-none z-[110]">
          <motion.div
            style={{ 
              scale: logoScale,
              top: logoTop,
              left: logoLeft,
              x: "-50%", 
              y: "-50%", 
              position: "fixed",
            }}
            className="pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <motion.div
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image 
                src={Logo} 
                alt="Bhojanalya Logo" 
                priority 
                className="w-[24rem] h-auto" 
              />
            </motion.div>
          </motion.div>
        </div>

        {/* --- TEXT CONTENT --- */}
        <motion.div
          style={{ opacity: heroContentOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="relative flex flex-col items-center mt-[450px] md:mt-[520px] text-center z-20 px-6"
        >
          <p className="text-white/70 text-sm md:text-lg max-w-xl mb-8 font-medium tracking-wide">
            The premium onboarding and management platform for organization and restaurant partners.
          </p>
          <button 
            onClick={() => router.push("/auth")} 
            className="px-10 py-4 rounded-full bg-[#FFCC00] text-[#2e0561] font-black uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 text-base"
          >
            Login / SignUp
          </button>
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="mt-16 opacity-30">
            <ChevronDown className="w-10 h-10 text-[#FFCC00]" />
          </motion.div>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 space-y-32 overflow-hidden bg-white">
        <FeatureRow 
          icon={<Globe className="w-8 h-8" />}
          title="Global Expansion"
          desc="Onboard partners from any region with multi-currency and localized compliance support."
          imageBg="bg-blue-50"
          reverse={false}
        />
        <FeatureRow 
          icon={<PieChart className="w-8 h-8" />}
          title="Advanced Reporting"
          desc="Visualize growth metrics with drill-down capabilities into specific outlet performance."
          imageBg="bg-purple-50"
          reverse={true}
        />
        <FeatureRow 
          icon={<Users className="w-8 h-8" />}
          title="Team Management"
          desc="Assign roles and permissions with granular control over who sees what data."
          imageBg="bg-yellow-50"
          reverse={false}
        />
        <FeatureRow 
          icon={<Zap className="w-8 h-8" />}
          title="Instant Onboarding"
          desc="Get partners up and running in minutes with our automated verification engine."
          imageBg="bg-green-50"
          reverse={true}
        />
      </section>

      <footer className="py-10 bg-white border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs font-bold tracking-[0.3em] uppercase">
          Bhojanalya © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function FeatureRow({ icon, title, desc, imageBg, reverse }: any) {
  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <motion.div 
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`${reverse ? "md:order-2" : ""}`}
      >
        <div className="text-[#471396] mb-6">{icon}</div>
        <h3 className="text-4xl font-black text-[#090040] mb-4">{title}</h3>
        <p className="text-gray-500 text-lg leading-relaxed">{desc}</p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={`h-[400px] rounded-[3rem] ${imageBg} border border-gray-100 shadow-inner flex items-center justify-center overflow-hidden`}
      >
        <div className="w-3/4 h-1/2 bg-white/50 rounded-2xl shadow-sm border border-white" />
      </motion.div>
    </div>
  );
}