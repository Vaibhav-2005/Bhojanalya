"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Clock, FileText, 
  ChevronRight, User, CheckCircle2, 
  Menu as MenuIcon, Loader2
} from "lucide-react";
import { Inter } from "next/font/google";
import { apiRequest } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  
  // States
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Track creation status
  const [restaurantCreated, setRestaurantCreated] = useState(false);
  // ✅ NEW: Store the ID so we can open the preview page
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | number | null>(null);

  const menuInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    restaurantName: "", 
    cuisine: "",
    ownerName: "", 
    email: "",     
    phone: "",
    address: "", 
    city: "", 
    state: "", 
    zip: "",
    gstin: "", 
    fssai: "",
    openTime: "", 
    closeTime: "",
    description: "", 
    menuFile: null as File | null,
  });

  // 1. Fetch Logged-in User Data AND Check if Restaurant Exists
  useEffect(() => {
    const init = async () => {
      try {
        // A. Check User
        const userData = await apiRequest('/protected/ping');
        setFormData(prev => ({
          ...prev,
          ownerName: userData.name || userData.email.split('@')[0],
          email: userData.email
        }));

        // B. ✅ SECURITY: Check if user already has a restaurant
        // If they do, they shouldn't be on the register page
        try {
          const myRestaurants = await apiRequest('/restaurants/me');
          if (myRestaurants && myRestaurants.length > 0) {
            // Already registered? Redirect to Dashboard immediately.
            router.replace("/dashboard");
            return;
          }
        } catch (e) {
          // If 404 or empty, that's good, they can proceed
        }

      } catch (err) {
        console.error("Failed to load user data", err);
        router.push("/auth"); 
      } finally {
        setIsLoadingUser(false);
      }
    };
    init();
  }, [router]);

  // --- Validation ---
  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};

    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = "Restaurant name is required";
      if (!formData.cuisine) newErrors.cuisine = "Cuisine type is required";
    }
    if (currentStep === 2) {
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "Valid 10-digit mobile number required";
    }
    if (currentStep === 3) {
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zip) newErrors.zip = "Zip Code is required";
    }
    if (currentStep === 4) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gstin && !gstRegex.test(formData.gstin)) newErrors.gstin = "Invalid GSTIN format";
    }
    if (currentStep === 5) {
      if (!formData.description) newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 1. SUBMIT DATA HANDLER (JSON) ---
  const submitRestaurantData = async () => {
    // If we already created it, return the existing ID
    if (restaurantCreated && createdRestaurantId) return createdRestaurantId;

    const payload = {
      name: formData.restaurantName,
      cuisine_type: formData.cuisine,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip,
      opening_time: formData.openTime,
      closing_time: formData.closeTime,
      phone: formData.phone,
      gstin: formData.gstin || undefined,
      fssai: formData.fssai || undefined
    };

    const response = await apiRequest('/restaurants', 'POST', payload);
    
    // Save the ID and status
    const newId = response.ID || response.id;
    setRestaurantCreated(true);
    setCreatedRestaurantId(newId);
    
    return newId;
  };

  // --- 2. SUBMIT FILE HANDLER ---
  const submitMenuFile = async () => {
    if (!formData.menuFile) return;

    const fileData = new FormData();
    fileData.append("menu_file", formData.menuFile);

    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/menus/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: fileData
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const json = JSON.parse(errorText);
        throw new Error(json.error || "Upload failed");
      } catch (e) {
        throw new Error(`Upload Error: ${errorText}`);
      }
    }
  };

  // --- COMBINED FINAL HANDLER ---
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.menuFile) {
        alert("Please select a menu file to continue.");
        return;
    }

    setIsSubmitting(true);

    try {
        // Step A: Create Restaurant & Get ID
        setStatusMessage("Creating Restaurant...");
        const restaurantId = await submitRestaurantData();

        // Step B: Upload Menu
        setStatusMessage("Uploading Menu...");
        await submitMenuFile();

        // Step C: Success Actions
        setStatusMessage("Done!");
        
        // 1. Open Preview in New Tab
        // ⚠️ Adjust URL structure below to match your actual preview route (e.g., /restaurant/[id])
        if (restaurantId) {
          window.open(`/preview?id=${restaurantId}`, "_blank");
        }

        // 2. Redirect Current Tab to Dashboard
        router.push("/dashboard");

    } catch (err: any) {
        console.error("Process failed:", err);
        alert(err.message || "Failed to complete registration.");
    } finally {
        setIsSubmitting(false);
        setStatusMessage("");
    }
  };

  // --- Navigation Handlers ---
  const handleNextStep = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handlePhoneInput = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, "");
    if (numbersOnly.length <= 10) handleChange("phone", numbersOnly);
  };

  const handleMenuUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, menuFile: e.target.files![0] }));
    }
  };

  if (isLoadingUser) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading user profile...</div>;
  }

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${inter.className}`}>
      
      {/* Header Area */}
      <div className="bg-[#471396] pt-32 pb-48 px-6 text-center text-white relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Register Your Restaurant</h1>
        <p className="text-purple-200 max-w-lg mx-auto text-lg mb-8">
          Join the Bhojanalya network. Let's get you set up in minutes.
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? "w-8 bg-[#FFCC00]" : i + 1 < step ? "w-2 bg-[#FFCC00]" : "w-2 bg-purple-800"}`} 
            />
          ))}
        </div>
      </div>

      {/* Form Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto -mt-32 bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8 md:p-12 relative z-10"
      >
        <form className="min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-grow"
            >
              {/* Steps 1-5 (Standard Inputs - Same as before) */}
              
              {step === 1 && (
                <div className="space-y-8">
                  <StepHeader title="General Information" subtitle="Tell us about your establishment" icon={<Utensils />} />
                  <div className="grid grid-cols-1 gap-8">
                    <Input label="Restaurant Name" value={formData.restaurantName} onChange={(e) => handleChange("restaurantName", e.target.value)} error={errors.restaurantName} placeholder="e.g. Royal Spice" />
                    <Input label="Cuisine Type" value={formData.cuisine} onChange={(e) => handleChange("cuisine", e.target.value)} error={errors.cuisine} placeholder="e.g. North Indian" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Owner Details" subtitle="Auto-filled from your account" icon={<User />} />
                  <Input label="Owner Full Name" value={formData.ownerName} disabled={true} className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Mobile Number" value={formData.phone} onChange={(e) => handlePhoneInput(e.target.value)} error={errors.phone} placeholder="9876543210" maxLength={10} />
                    <Input label="Email ID" value={formData.email} disabled={true} className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <StepHeader title="Location" subtitle="Where can customers find you?" icon={<MapPin />} />
                  <Input label="Street Address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} error={errors.address} placeholder="Plot No, Street, Landmark" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input label="City" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} error={errors.city} placeholder="Gurugram" />
                    <Input label="State" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} error={errors.state} placeholder="Haryana" />
                    <Input label="Zip Code" value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} error={errors.zip} maxLength={6} placeholder="122001" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <StepHeader title="Legal Documents" subtitle="Compliance information" icon={<FileText />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="GSTIN Number" value={formData.gstin} onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())} error={errors.gstin} placeholder="22AAAAA0000A1Z5" />
                    <Input label="FSSAI License" value={formData.fssai} onChange={(e) => handleChange("fssai", e.target.value)} placeholder="License Number" />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader title="Details & Timings" subtitle="Operational hours and description" icon={<Clock />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Opening Time" type="time" value={formData.openTime} onChange={(e) => handleChange("openTime", e.target.value)} />
                    <Input label="Closing Time" type="time" value={formData.closeTime} onChange={(e) => handleChange("closeTime", e.target.value)} />
                  </div>
                  <div className="relative pt-2">
                    <label className="text-sm font-bold text-slate-800 mb-1.5 block">Short Description</label>
                    <textarea className={`w-full px-4 py-4 bg-slate-50 border rounded-xl outline-none transition-all h-32 resize-none text-slate-600 font-semibold placeholder:text-gray-400 placeholder:font-medium ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#2E0561]"}`} placeholder="e.g. Authentic flavors from Punjab..." value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                    {errors.description && <span className="text-xs text-red-600 font-bold ml-1">{errors.description}</span>}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Restaurant Menu" subtitle="Upload your menu card" icon={<MenuIcon />} />
                  <div className="max-w-xl mx-auto flex flex-col gap-6">
                    
                    {/* File Selection Area */}
                    <div 
                      onClick={() => menuInputRef.current?.click()} 
                      className={`
                        border-2 border-dashed rounded-2xl p-10 text-center group flex flex-col items-center justify-center min-h-[250px] relative transition-colors
                        ${formData.menuFile ? "border-green-200 bg-green-50" : "cursor-pointer border-slate-300 hover:border-[#FFCC00] hover:bg-yellow-50"}
                      `}
                    >
                       <input type="file" ref={menuInputRef} onChange={handleMenuUpload} accept=".pdf,.jpg" className="hidden" />
                       
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm border ${formData.menuFile ? "bg-green-100 border-green-200" : "bg-white border-slate-200"}`}>
                          {formData.menuFile ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <MenuIcon className="w-8 h-8 text-[#FFCC00]" />}
                       </div>
                       
                       {formData.menuFile ? (
                        <>
                          <span className="text-slate-900 font-bold text-xl">File Selected</span>
                          <p className="text-sm text-green-700 font-medium mt-2">{formData.menuFile.name}</p>
                          <button type="button" className="mt-6 text-xs font-bold text-slate-500 underline hover:text-red-500">Change File</button>
                        </>
                       ) : (
                        <>
                          <span className="text-slate-900 font-bold text-xl">Select Menu File</span>
                          <p className="text-sm text-slate-500 mt-3 px-8 leading-relaxed">Supported formats: PDF, JPG, PNG.</p>
                          <span className="mt-8 text-xs font-bold text-slate-900 bg-[#FFCC00] px-6 py-3 rounded-full shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">Browse</span>
                        </>
                       )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handleBack} 
                disabled={isSubmitting} 
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : <div />}
            
            {step < totalSteps ? (
                <button 
                  onClick={handleNextStep}
                  type="button"
                  className="px-8 py-3 bg-[#FFCC00] text-[#2E0561] font-bold rounded-lg hover:bg-[#ffdb4d] flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
            ) : (
                <button 
                  onClick={handleCompleteRegistration}
                  disabled={isSubmitting || !formData.menuFile} 
                  className={`
                    px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all
                    ${(!formData.menuFile || isSubmitting)
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                      : "bg-[#FFCC00] text-[#2E0561] hover:bg-[#ffdb4d] shadow-yellow-500/20"}
                  `}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {statusMessage || "Processing..."}</>
                  ) : (
                    <>Complete Registration <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// --- Reusable Sub-Components ---
function StepHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 text-[#2E0561] mb-2">
        <div className="p-2.5 bg-purple-100 rounded-lg">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-slate-500 ml-12">{subtitle}</p>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-bold text-slate-800 ml-1">{label}</label>
      <input className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all text-slate-600 font-semibold placeholder:text-gray-400 placeholder:font-medium ${error ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#2E0561]"} ${className}`} {...props} />
      {error && <span className="text-xs text-red-600 font-bold ml-1">{error}</span>}
    </div>
  );
}