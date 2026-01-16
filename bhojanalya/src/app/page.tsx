"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Logo from "../../public/bhojnalaya-text.png";
import {
  BarChart3,
  Utensils,
  ChevronDown,
  Zap,
  Globe,
  PieChart,
  Users
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();

  // --- LOGO ANIMATION LOGIC ---
  const logoScale = useTransform(scrollY, [0, 300], [2.5, 0.45]);
  const logoY = useTransform(scrollY, [0, 300], ["0vh", "-45vh"]);
  const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const cornerScale = useTransform(scrollY, [0, 200], [1, 1.15]);
  const navBgOpacity = useTransform(scrollY, [250, 300], [0, 1]);

  return (
    <div className="relative min-h-screen bg-white font-sans selection:bg-[#FFCC00] selection:text-[#2e0561]">

      {/* --- STICKY NAV --- */}
      <motion.nav
        style={{ backgroundColor: "#471396", opacity: navBgOpacity }}
        className="fixed top-0 w-full z-[100] h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/10 shadow-xl pointer-events-none"
      >
        <div className="w-24 hidden md:block" />
        <div className="flex-1" />
        <button
          onClick={() => router.push("/auth")}
          className="px-6 py-2 rounded-lg bg-[#FFCC00] text-[#471396] font-bold hover:bg-white transition-colors text-sm pointer-events-auto"
        >
          Login/SignUp
        </button>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center bg-[#2e0561] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e0561] via-[#2e0561] to-[#1a033a] opacity-90" />
        
        {/* --- YELLOW CORNERS (#FFCC00) --- */}
        <motion.div
          style={{ opacity: heroContentOpacity, scale: cornerScale }}
          className="absolute inset-0 pointer-events-none p-6 md:p-16 z-10"
        >
          <div className="absolute top-10 left-10 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-l-[8px] border-[#FFCC00]" />
          <div className="absolute top-10 right-10 w-16 h-16 md:w-24 md:h-24 border-t-[8px] border-r-[8px] border-[#FFCC00]" />
          <div className="absolute bottom-10 left-10 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-l-[8px] border-[#FFCC00]" />
          <div className="absolute bottom-10 right-10 w-16 h-16 md:w-24 md:h-24 border-b-[8px] border-r-[8px] border-[#FFCC00]" />
        </motion.div>

        {/* LOGO: Elegantly Rising to Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{ scale: logoScale, y: logoY, position: "fixed", zIndex: 110, left: "50%", translateX: "-50%" }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Image src={Logo} alt="Bhojanalya Logo" priority className="w-64 md:w-96 h-auto" />
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: heroContentOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative flex flex-col items-center mt-[450px] md:mt-[520px] text-center z-20 px-6"
        >
          <p className="text-white/70 text-sm md:text-lg max-w-xl mb-10 font-medium tracking-wide">
            The premium onboarding and management platform for organization and restaurant partners.
          </p>
          <button onClick={() => router.push("/auth")} className="px-14 py-5 rounded-full bg-[#FFCC00] text-[#2e0561] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-yellow-500/30 text-lg">
            Login/SignUp
          </button>
          <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="mt-16 opacity-30">
            <ChevronDown className="w-10 h-10 text-[#FFCC00]" />
          </motion.div>
        </motion.div>
      </section>

      {/* --- ALTERNATING FEATURES SECTION --- */}
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

      

      {/* --- FINAL SMALL FOOTER --- */}
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
