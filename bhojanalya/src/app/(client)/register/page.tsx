"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Clock, FileText, ChevronRight, User, CheckCircle2, 
  Loader2, Image as ImageIcon, X as CloseIcon, UploadCloud, AlertCircle, RefreshCw
} from "lucide-react";
import { Outfit } from "next/font/google"; 
import { apiRequest } from "@/lib/api";

const outfit = Outfit({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#471396]"><Loader2 className="animate-spin" size={32} /></div>}>
      <RegisterFormContent />
    </Suspense>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
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

  // --- 1. SESSION & STATUS SYNC ---
  const fetchStatusAndSync = async () => {
    try {
      const onboardRes = await apiRequest('/auth/protected/onboarding', 'GET');
      const status = (onboardRes.onboarding_status || "null").toUpperCase();
      setCurrentStatus(status);

      const myRestaurants = await apiRequest('/restaurants/me');
      if (myRestaurants?.[0]) {
        const res = myRestaurants[0];
        setRestaurantId(res.ID || res.id);
      }

      // STATE ROUTING: BOTH, DEALS, and COMPLETED all go to /deals
      if (status === "NULL") {
        setStep(1);
      } else if (["REGISTERED", "MENU_PENDING", "PHOTO_PENDING"].includes(status)) {
        setStep(6); 
      } else if (["BOTH_COMPLETED", "DEALS_COMPLETED", "COMPLETED"].includes(status)) {
        router.replace("/deals");
        return;
      }
      
    } catch (err) {
      console.error("Sync error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const logout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/auth"; };

    if (!token) return logout();

    try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        if (payload.role?.toUpperCase() === "ADMIN") return logout();
    } catch (e) { return logout(); }

    if (!sessionStorage.getItem("nav_intent")) {
        router.replace("/auth");
        return;
    }

    fetchStatusAndSync();
  }, [router]);

  // --- 2. VALIDATION ---
  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};
    
    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = "Name is required";
      if (!formData.cuisine) newErrors.cuisine = "Cuisine is required";
    }
    if (currentStep === 2) {
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "10-digit number required";
    }
    if (currentStep === 3) {
      if (!formData.city) newErrors.city = "City is required";
    }
    if (currentStep === 5) {
      if (!formData.openTime) newErrors.openTime = "Opening time required";
      if (!formData.closeTime) newErrors.closeTime = "Closing time required";
      if (!formData.description || formData.description.length < 20) newErrors.description = "Min 20 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 3. CORRECTED POSITIONING LOGIC ---
  const updatePositioning = async (targetType: 'MENU' | 'PHOTO') => {
    let newStatus = "";

    if (targetType === 'MENU') {
      // If we are currently waiting ONLY for the menu, now we have both.
      // Otherwise, we are now waiting for the photo.
      newStatus = (currentStatus === "MENU_PENDING") ? "BOTH_COMPLETED" : "PHOTO_PENDING";
    } else {
      // If we are currently waiting ONLY for the photo, now we have both.
      // Otherwise, we are now waiting for the menu.
      newStatus = (currentStatus === "PHOTO_PENDING") ? "BOTH_COMPLETED" : "MENU_PENDING";
    }

    await apiRequest('/auth/protected/onboarding', 'PATCH', { onboarding_status: newStatus });
    await fetchStatusAndSync();
  };

  // --- 4. ACTIONS ---
  const handleRegister = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/restaurants', 'POST', {
        name: formData.restaurantName, cuisine_type: formData.cuisine,
        short_description: formData.description, address: formData.address,
        city: formData.city, state: formData.state, zip_code: formData.zip,
        opens_at: formData.openTime, closes_at: formData.closeTime, phone: formData.phone
      });
      setRestaurantId(res.ID || res.id);
      await apiRequest('/auth/protected/onboarding', 'PATCH', { onboarding_status: "REGISTERED" });
      await fetchStatusAndSync(); 
      notify("Profile registered!", "success");
    } catch (err: any) { notify("Error saving profile", "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleUploadMenu = async () => {
    if (!formData.menuFile || !restaurantId) return;
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("menu_file", formData.menuFile);
      data.append("restaurant_id", String(restaurantId));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menus/upload`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data
      });
      if (res.ok) { setIsMenuUploadedLocal(true); setCheckCooldown(5); notify("Menu uploaded", "success"); }
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
        setCheckCooldown(8); 
        notify("Parsing...", "error");
      }
    } catch (err) { notify("Check failed", "error"); }
  };

  const handleUploadPhotos = async () => {
    if (formData.photos.length === 0 || !restaurantId) return;
    setIsSubmitting(true);
    try {
      for (const photo of formData.photos) {
        const data = new FormData();
        data.append("images", photo); 
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/restaurants/${restaurantId}/images`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: data
        });
      }
      notify("Photos saved!", "success");
      await updatePositioning('PHOTO');
    } catch (err) { notify("Photo error", "error"); }
    finally { setIsSubmitting(false); }
  };

  const notify = (msg: string, type: 'success' | 'error') => {
    setNotification({ message: msg, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (checkCooldown > 0) {
      const timer = setTimeout(() => setCheckCooldown(checkCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [checkCooldown]);

  if (isLoading) return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 ${outfit.className}`}>
        <Loader2 className="animate-spin text-[#471396] w-12 h-12"/>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Journey...</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${outfit.className}`}>
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
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Onboarding</h1>
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
                  <StepHeader title="General Info" icon={<Utensils />} subtitle="Establishment basics" />
                  <Input label="Restaurant Name *" value={formData.restaurantName} onChange={(e:any) => setFormData({...formData, restaurantName: e.target.value})} error={errors.restaurantName} />
                  <Input label="Cuisine Type *" value={formData.cuisine} onChange={(e:any) => setFormData({...formData, cuisine: e.target.value})} error={errors.cuisine} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Contact Details" icon={<User />} subtitle="Owner Information" />
                  <div className="space-y-6">
                    <Input label="Owner Full Name" value={localStorage.getItem("name") || "Partner"} disabled={true} className="bg-slate-50 text-slate-400 border-dashed" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Mobile Number *" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="9876543210" error={errors.phone} />
                      <Input label="Email ID" value={localStorage.getItem("email") || ""} disabled={true} className="bg-slate-50 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <StepHeader title="Location" icon={<MapPin />} subtitle="Physical address" />
                  <Input label="Street Address" value={formData.address} onChange={(e:any) => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="City *" value={formData.city} onChange={(e:any) => setFormData({...formData, city: e.target.value})} error={errors.city} />
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
                  <StepHeader title="Operations" icon={<Clock />} subtitle="Timings & Bio are mandatory" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Opens At *" type="time" value={formData.openTime} onChange={(e:any) => setFormData({...formData, openTime: e.target.value})} error={errors.openTime} />
                    <Input label="Closes At *" type="time" value={formData.closeTime} onChange={(e:any) => setFormData({...formData, closeTime: e.target.value})} error={errors.closeTime} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest ml-1">Bio Description *</label>
                    <textarea placeholder="Tell us about your kitchen..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-700 font-bold h-32 resize-none focus:border-[#471396] transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    {errors.description && <span className="text-[10px] text-red-500 font-black uppercase tracking-tight ml-1">{errors.description}</span>}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Asset Upload" icon={<UploadCloud />} subtitle="Phase 2: Digital Presence" />
                  
                  {/* Digital Menu - Checked if Status is PHOTO_PENDING (Menu is done) or BOTH_COMPLETED */}
                  <div className={`p-6 border rounded-2xl transition-all ${(["PHOTO_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "")) ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">1. Digital Menu *</label>
                    {!isMenuUploadedLocal && !(["PHOTO_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "")) ? (
                       <div className="flex gap-4">
                          <div onClick={() => menuInputRef.current?.click()} className="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer bg-white hover:border-[#FFCC00]">
                              <input type="file" ref={menuInputRef} className="hidden" onChange={(e) => setFormData({...formData, menuFile: e.target.files![0]})} />
                              <span className="text-sm font-bold text-slate-500 truncate block">{formData.menuFile ? formData.menuFile.name : "Select File"}</span>
                          </div>
                          <button type="button" onClick={handleUploadMenu} disabled={!formData.menuFile || isSubmitting} className="px-6 bg-[#2E0561] text-white rounded-xl font-bold text-xs uppercase disabled:opacity-30">Upload</button>
                       </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-600">{isParsingDone || ["PHOTO_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "") ? "Menu Ready" : "Analyzing Items..."}</span>
                        <button type="button" onClick={checkParsingStatus} disabled={checkCooldown > 0 || isParsingDone || ["PHOTO_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "")} className="px-4 py-2 bg-[#471396] text-white rounded-lg text-[10px] font-bold uppercase disabled:opacity-50">
                            {checkCooldown > 0 ? `Wait ${checkCooldown}s` : "Verify"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Photos - Checked if Status is MENU_PENDING (Photo is done) or BOTH_COMPLETED */}
                  <div className={`p-6 border rounded-2xl transition-all ${(["MENU_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "")) ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">2. Photos (Images Only, Max 3)</label>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        {formData.photos.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setFormData(p => ({...p, photos: p.photos.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><CloseIcon size={10} /></button>
                            </div>
                        ))}
                        {formData.photos.length < 3 && !(["MENU_PENDING", "BOTH_COMPLETED"].includes(currentStatus || "")) && (
                            <div onClick={() => photoInputRef.current?.click()} className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#FFCC00]">
                                <input type="file" ref={photoInputRef} multiple accept="image/*" className="hidden" 
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      const images = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
                                      setFormData(p => ({...p, photos: [...p.photos, ...images].slice(0, 3)}));
                                    }
                                  }} 
                                />
                                <ImageIcon className="text-slate-300" />
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={handleUploadPhotos} disabled={formData.photos.length === 0 || isSubmitting || (["MENU_PENDING", "BOTH_COMPLETED"].includes(currentStatus || ""))} className="w-full py-3.5 bg-[#2E0561] text-white rounded-xl font-bold text-xs uppercase disabled:opacity-30">Save Gallery</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            {step > 1 && step < 6 && <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-800 transition-colors">Back</button>}
            
            {step < 5 && <button type="button" onClick={() => validateStep(step) && setStep(step + 1)} className="ml-auto px-10 py-3.5 bg-[#FFCC00] text-[#2E0561] font-bold rounded-2xl hover:bg-[#ffdb4d] flex gap-2 items-center shadow-lg active:scale-95 transition-all">Continue <ChevronRight size={18} /></button>}
            
            {step === 5 && <button type="button" onClick={handleRegister} disabled={isSubmitting} className="ml-auto px-10 py-3.5 bg-[#FFCC00] text-[#2E0561] font-bold rounded-2xl hover:bg-[#ffdb4d] flex gap-2 items-center shadow-lg active:scale-95 transition-all">{isSubmitting ? <Loader2 className="animate-spin" /> : <>Complete <ChevronRight size={18} /></>}</button>}
            
            {step === 6 && (
                <button type="button" onClick={() => fetchStatusAndSync()} disabled={!["BOTH_COMPLETED", "DEALS_COMPLETED", "COMPLETED"].includes(currentStatus || "")} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl flex justify-center gap-2 items-center shadow-xl disabled:opacity-50 active:scale-[0.99] transition-all">
                    Finish & Go to Deals <CheckCircle2 size={18} />
                </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function StepHeader({ title, subtitle, icon }: any) {
  return (
    <div className="flex items-start gap-5 mb-10">
      <div className="p-3.5 bg-purple-50 rounded-2xl text-[#2E0561] shrink-0 border border-purple-100 flex items-center justify-center">
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