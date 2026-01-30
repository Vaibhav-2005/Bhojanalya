"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Clock, FileText, ChevronRight, User, CheckCircle2, 
  Loader2, Image as ImageIcon, X as CloseIcon, UploadCloud, AlertCircle, RefreshCw
} from "lucide-react";
import { Inter } from "next/font/google";
import { apiRequest } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#471396]"><Loader2 className="animate-spin" /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  
  // --- UI & ONBOARDING STATES ---
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // --- POSITIONING & ASSET STATES ---
  const [currentStatus, setCurrentStatus] = useState<string | null>(null); 
  const [restaurantId, setRestaurantId] = useState<string | number | null>(null);

  const [isMenuUploadedLocal, setIsMenuUploadedLocal] = useState(false);
  const [isParsingDone, setIsParsingDone] = useState(false);
  const [checkCooldown, setCheckCooldown] = useState(0);
  const [canRetryMenu, setCanRetryMenu] = useState(false);

  const menuInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    restaurantName: "", cuisine: "", phone: "", address: "", city: "", state: "", zip: "", 
    gstin: "", fssai: "", openTime: "", closeTime: "", description: "", 
    menuFile: null as File | null, photos: [] as File[],
  });

  // --- 1. CORE STATUS SYNC ---
  const fetchStatusAndSync = async () => {
    try {
      // Get the onboarding status keyword
      const onboardRes = await apiRequest('/auth/protected/onboarding', 'GET');
      const status = (onboardRes.onboarding_status || "null").toUpperCase();
      setCurrentStatus(status);

      const myRestaurants = await apiRequest('/restaurants/me');
      if (myRestaurants && myRestaurants.length > 0) {
        const res = myRestaurants[0];
        setRestaurantId(res.ID || res.id);
      }

      // Redirection logic
      if (status === "NULL" || status === "null") setStep(1);
      else if (["REGISTERED", "MENU_PENDING", "PHOTO_PENDING"].includes(status)) setStep(6);
      else if (status === "BOTH_COMPLETED") router.replace("/deals");
      else if (status === "DEALS_COMPLETED" || status === "COMPLETED") router.replace("/preview");
      
    } catch (err) {
      console.error("Status check failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("nav_intent")) {
        window.location.href = "/auth";
        return;
    }
    fetchStatusAndSync();
  }, []);

  useEffect(() => {
    if (checkCooldown > 0) {
      const timer = setTimeout(() => setCheckCooldown(checkCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [checkCooldown]);

  // --- 2. POSITIONING UPDATE LOGIC ---
  const updateOnboardingKeyword = async (newKeyword: string) => {
    try {
      await apiRequest('/auth/protected/onboarding', 'PATCH', {
        onboarding_status: newKeyword
      });
    } catch (err) {
      console.error("Failed to update onboarding keyword", err);
    }
  };

  const updatePositioning = async (targetType: 'MENU' | 'PHOTO') => {
    let newStatus = "";
    if (targetType === 'MENU') {
      newStatus = currentStatus === "REGISTERED" ? "PHOTO_PENDING" : "BOTH_COMPLETED";
    } else {
      newStatus = currentStatus === "REGISTERED" ? "MENU_PENDING" : "BOTH_COMPLETED";
    }
    await updateOnboardingKeyword(newStatus);
    await fetchStatusAndSync();
  };

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ message: msg, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- 3. ACTIONS ---
  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      // A. Register Restaurant
      const res = await apiRequest('/restaurants', 'POST', {
        name: formData.restaurantName, cuisine_type: formData.cuisine,
        short_description: formData.description, address: formData.address,
        city: formData.city, state: formData.state, zip_code: formData.zip,
        opens_at: formData.openTime, closes_at: formData.closeTime, phone: formData.phone
      });
      setRestaurantId(res.ID || res.id);

      // B. CRITICAL: Update keyword to REGISTERED in DB
      await updateOnboardingKeyword("REGISTERED");

      // C. Refresh and jump to Step 6
      await fetchStatusAndSync(); 
      notify("Registration Complete!", "success");
    } catch (err: any) { 
      notify(err.message, "error"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Menu/Photo upload handlers remain same as your previous logic...
  const handleUploadMenu = async () => {
    if (!formData.menuFile || !restaurantId) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("menu_file", formData.menuFile);
      data.append("restaurant_id", String(restaurantId));
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/menus/upload`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data
      });
      if (res.ok) {
        setIsMenuUploadedLocal(true);
        setCheckCooldown(5); 
        notify("Menu uploaded. Please check status in 5s.", "success");
      }
    } catch (err) { notify("Upload failed", "error"); }
    finally { setIsSubmitting(false); }
  };

  const checkParsingStatus = async () => {
    if (!restaurantId || checkCooldown > 0) return;
    try {
      const res = await apiRequest(`/menus/${restaurantId}/status`);
      if (res.status === "PARSED") {
        setIsParsingDone(true);
        notify("Menu parsed!", "success");
        await updatePositioning('MENU');
      } else {
        setCanRetryMenu(res.can_retry || false);
        setCheckCooldown(5); 
        notify("Still parsing...", "error");
      }
    } catch (err) { notify("Status check failed", "error"); }
  };

  const handleUploadPhotos = async () => {
    if (formData.photos.length === 0 || !restaurantId) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      for (const photo of formData.photos) {
        const data = new FormData();
        data.append("images", photo); 
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/restaurants/${restaurantId}/images`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data
        });
      }
      notify("Photos Saved!", "success");
      await updatePositioning('PHOTO');
    } catch (err) { notify("Photo upload failed", "error"); }
    finally { setIsSubmitting(false); }
  };

  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};
    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = "Required";
      if (!formData.cuisine) newErrors.cuisine = "Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating...</div>;

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${inter.className}`}>
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm bg-white border ${notification.type === 'success' ? 'text-green-600 border-green-100' : 'text-red-600 border-red-100'}`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#471396] pt-32 pb-48 px-6 text-center text-white relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Onboarding</h1>
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? "w-10 bg-[#FFCC00]" : i + 1 < step ? "w-2 bg-[#FFCC00]" : "w-2 bg-purple-800"}`} />
          ))}
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-4xl mx-auto -mt-32 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative z-10">
        <form className="min-h-[450px] flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-grow">
              
              {step === 1 && (
                <div className="space-y-8">
                  <StepHeader title="General Information" icon={<Utensils />} subtitle="Establishment basics" />
                  <Input label="Restaurant Name" value={formData.restaurantName} onChange={(e:any) => setFormData({...formData, restaurantName: e.target.value})} error={errors.restaurantName} />
                  <Input label="Cuisine Type" value={formData.cuisine} onChange={(e:any) => setFormData({...formData, cuisine: e.target.value})} error={errors.cuisine} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Owner Details" icon={<User />} subtitle="Primary contact info" />
                  <Input label="Owner Full Name" value={localStorage.getItem("name") || "Partner"} disabled={true} className="bg-slate-50 text-slate-400" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Mobile Number" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="9876543210" />
                    <Input label="Email ID" value={localStorage.getItem("email") || ""} disabled={true} className="bg-slate-50 text-slate-400" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <StepHeader title="Location" icon={<MapPin />} subtitle="Physical address" />
                  <Input label="Street Address" value={formData.address} onChange={(e:any) => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="City" value={formData.city} onChange={(e:any) => setFormData({...formData, city: e.target.value})} />
                    <Input label="State" value={formData.state} onChange={(e:any) => setFormData({...formData, state: e.target.value})} />
                    <Input label="Zip Code" value={formData.zip} onChange={(e:any) => setFormData({...formData, zip: e.target.value})} maxLength={6} />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <StepHeader title="Compliance" icon={<FileText />} subtitle="Tax and licensing" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="GSTIN" value={formData.gstin} onChange={(e:any) => setFormData({...formData, gstin: e.target.value.toUpperCase()})} />
                    <Input label="FSSAI License" value={formData.fssai} onChange={(e:any) => setFormData({...formData, fssai: e.target.value})} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader title="Operations" icon={<Clock />} subtitle="Timings and Bio" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Opens" type="time" value={formData.openTime} onChange={(e:any) => setFormData({...formData, openTime: e.target.value})} />
                    <Input label="Closes" type="time" value={formData.closeTime} onChange={(e:any) => setFormData({...formData, closeTime: e.target.value})} />
                  </div>
                  <textarea placeholder="Describe your establishment..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-700 font-bold h-32 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Upload Assets" subtitle="Positioning: Asset Phase" icon={<UploadCloud />} />
                  
                  {/* MENU BLOCK */}
                  <div className={`p-6 border rounded-2xl transition-all ${(currentStatus === 'PHOTO_PENDING' || currentStatus === 'BOTH_COMPLETED') ? 'bg-green-50 border-green-200' : (currentStatus === 'PHOTO_PENDING' ? 'opacity-40 grayscale pointer-events-none' : 'bg-slate-50 border-slate-100')}`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Menu (Required)</label>
                        {(currentStatus === 'PHOTO_PENDING' || currentStatus === 'BOTH_COMPLETED') && <CheckCircle2 className="text-green-600" size={16} />}
                    </div>
                    
                    {!isMenuUploadedLocal && currentStatus !== 'PHOTO_PENDING' && currentStatus !== 'BOTH_COMPLETED' ? (
                       <div className="flex gap-4">
                          <div onClick={() => menuInputRef.current?.click()} className="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer bg-white hover:border-[#FFCC00]">
                              <input type="file" ref={menuInputRef} className="hidden" onChange={(e) => setFormData({...formData, menuFile: e.target.files![0]})} />
                              <span className="text-sm font-bold text-slate-500 truncate block">{formData.menuFile ? formData.menuFile.name : "Select Menu"}</span>
                          </div>
                          <button type="button" onClick={handleUploadMenu} disabled={!formData.menuFile || isSubmitting} className="px-6 bg-[#2E0561] text-white rounded-xl font-bold text-xs uppercase disabled:opacity-30">Upload</button>
                       </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-600">{isParsingDone ? "Parsing Complete" : "Processing Menu..."}</span>
                            <button type="button" onClick={checkParsingStatus} disabled={checkCooldown > 0 || isParsingDone} className="px-4 py-2 bg-[#471396] text-white rounded-lg text-[10px] font-bold uppercase disabled:opacity-50 flex items-center gap-2">
                               {checkCooldown > 0 ? `Wait ${checkCooldown}s` : "Check Status"}
                            </button>
                         </div>
                         {canRetryMenu && <button type="button" onClick={() => handleUploadMenu()} className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase"><RefreshCw size={12}/> Parsing Failed. Retry?</button>}
                      </div>
                    )}
                  </div>

                  {/* PHOTO BLOCK */}
                  <div className={`p-6 border rounded-2xl transition-all ${(currentStatus === 'MENU_PENDING' || currentStatus === 'BOTH_COMPLETED') ? 'bg-green-50 border-green-200' : (currentStatus === 'MENU_PENDING' ? 'opacity-40 grayscale pointer-events-none' : 'bg-slate-50 border-slate-100')}`}>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Photos (Max 3)</label>
                        {(currentStatus === 'MENU_PENDING' || currentStatus === 'BOTH_COMPLETED') && <CheckCircle2 className="text-green-600" size={16} />}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        {formData.photos.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFormData(p => ({...p, photos: p.photos.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><CloseIcon size={10} /></button>
                            </div>
                        ))}
                        {formData.photos.length < 3 && !(currentStatus === 'MENU_PENDING' || currentStatus === 'BOTH_COMPLETED') && (
                            <div onClick={() => photoInputRef.current?.click()} className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#FFCC00]">
                                <input type="file" ref={photoInputRef} multiple className="hidden" onChange={(e) => e.target.files && setFormData(p => ({...p, photos: [...p.photos, ...Array.from(e.target.files!)]}))} />
                                <ImageIcon className="text-slate-300" />
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={handleUploadPhotos} disabled={formData.photos.length === 0 || isSubmitting || currentStatus === 'MENU_PENDING' || currentStatus === 'BOTH_COMPLETED'} className="w-full py-3.5 bg-[#2E0561] text-white rounded-xl font-bold text-xs uppercase disabled:opacity-30">Save Photos</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            {step > 1 && step < 6 && <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-800 transition-colors">Back</button>}
            
            {step < 5 && <button type="button" onClick={() => validateStep(step) && setStep(step + 1)} className="ml-auto px-10 py-3.5 bg-[#FFCC00] text-[#2E0561] font-bold rounded-2xl hover:bg-[#ffdb4d] flex gap-2 items-center shadow-lg active:scale-95 transition-all">Continue <ChevronRight size={18} /></button>}
            
            {step === 5 && <button type="button" onClick={handleRegister} disabled={isSubmitting} className="ml-auto px-10 py-3.5 bg-[#FFCC00] text-[#2E0561] font-bold rounded-2xl hover:bg-[#ffdb4d] flex gap-2 items-center shadow-lg active:scale-95 transition-all">{isSubmitting ? <Loader2 className="animate-spin" /> : <>Complete Registration <ChevronRight size={18} /></>}</button>}
            
            {step === 6 && (
                <button type="button" onClick={() => fetchStatusAndSync()} disabled={currentStatus !== 'BOTH_COMPLETED'} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 flex justify-center gap-2 items-center shadow-xl disabled:opacity-50 transition-all active:scale-[0.99]">
                    Finish & Go to Deals <CheckCircle2 size={18} />
                </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Symmetrical Header UI
function StepHeader({ title, subtitle, icon }: any) {
  return (
    <div className="flex items-start gap-5 mb-10">
      <div className="p-3.5 bg-purple-50 rounded-2xl text-[#2E0561] shrink-0 shadow-sm border border-purple-100 flex items-center justify-center">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex flex-col gap-1 mt-0.5 text-left">
        <h2 className="text-2xl font-black text-[#2E0561] leading-tight tracking-tight">{title}</h2>
        <p className="text-slate-400 font-semibold text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function Input({ label, error, className, ...props }: any) {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">{label}</label>
      <input className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none transition-all text-slate-700 font-bold border-slate-100 focus:border-[#2E0561] focus:bg-white ${className}`} {...props} />
      {error && <span className="text-[10px] text-red-500 font-black uppercase tracking-tight ml-1">{error}</span>}
    </div>
  );
}