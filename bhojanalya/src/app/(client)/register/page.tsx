"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Clock, FileText, 
  ChevronRight, User, CheckCircle2, 
  Menu as MenuIcon, Sparkles
} from "lucide-react";
import { Inter } from "next/font/google";
import { apiRequest } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Refs
  const menuInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    restaurantName: "", 
    cuisine: "",
    // Step 2
    ownerName: "", 
    email: "",     
    phone: "",
    // Step 3
    address: "", 
    city: "", 
    state: "", 
    zip: "",
    // Step 4
    gstin: "", 
    fssai: "",
    // Step 5
    openTime: "", 
    closeTime: "",
    description: "", 
    // Step 6
    menuFile: null as File | null,
  });

  // 1. Fetch Logged-in User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiRequest('/protected/ping');
        setFormData(prev => ({
          ...prev,
          ownerName: userData.name || userData.email.split('@')[0],
          email: userData.email
        }));
      } catch (err) {
        console.error("Failed to load user data", err);
        router.push("/auth"); 
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  // --- Validation Logic ---
  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};

    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = "Restaurant name is required";
      if (!formData.cuisine) newErrors.cuisine = "Cuisine type is required";
    }

    if (currentStep === 2) {
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "Valid 10-digit mobile number required";
    }

    if (currentStep === 4) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gstin && !gstRegex.test(formData.gstin)) {
        newErrors.gstin = "Invalid GSTIN format";
      }
    }
    
    if (currentStep === 5) {
      if (!formData.description) newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        setIsSubmitting(true);
        try {
          // Payload Sanitization
          const payload = {
            name: formData.restaurantName,
            city: formData.city || "Unknown",
            cuisine_type: formData.cuisine
          };

          await apiRequest('/restaurants', 'POST', payload);
          alert("Registration Submitted Successfully!");
          router.push("/dashboard");

        } catch (err: any) {
          console.error("Submission error:", err);
          alert(err.message || "Failed to register. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
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
        <form onSubmit={handleNext} className="min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-grow"
            >
              {/* Step 1: General Info */}
              {step === 1 && (
                <div className="space-y-8">
                  <StepHeader title="General Information" subtitle="Tell us about your establishment" icon={<Utensils />} />
                  <div className="grid grid-cols-1 gap-8">
                    <Input 
                      label="Restaurant Name" 
                      value={formData.restaurantName}
                      onChange={(e) => handleChange("restaurantName", e.target.value)}
                      error={errors.restaurantName}
                      placeholder="e.g. Royal Spice" 
                    />
                    <Input 
                      label="Cuisine Type" 
                      value={formData.cuisine}
                      onChange={(e) => handleChange("cuisine", e.target.value)}
                      error={errors.cuisine}
                      placeholder="e.g. North Indian" 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Owner Details (UPDATED LAYOUT) */}
              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Owner Details" subtitle="Auto-filled from your account" icon={<User />} />
                  
                  {/* Row 1: Owner Name (Full Width) */}
                  <Input 
                    label="Owner Full Name" 
                    value={formData.ownerName}
                    disabled={true} 
                    className="bg-slate-100 text-slate-500 cursor-not-allowed" 
                  />

                  {/* Row 2: Mobile & Email (Side by Side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                      label="Mobile Number" 
                      value={formData.phone}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      error={errors.phone}
                      placeholder="9876543210" 
                      maxLength={10}
                    />
                    <Input 
                      label="Email ID" 
                      value={formData.email}
                      disabled={true} 
                      className="bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-8">
                  <StepHeader title="Location" subtitle="Where can customers find you?" icon={<MapPin />} />
                  <Input 
                    label="Street Address" 
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Plot No, Street, Landmark"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input 
                      label="City" 
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Gurugram"
                    />
                    <Input 
                      label="State" 
                      value={formData.state} 
                      onChange={(e) => handleChange("state", e.target.value)} 
                      placeholder="Haryana"
                    />
                    <Input 
                      label="Zip Code" 
                      value={formData.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      maxLength={6}
                      placeholder="122001"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Legal */}
              {step === 4 && (
                <div className="space-y-8">
                  <StepHeader title="Legal Documents" subtitle="Compliance information" icon={<FileText />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                      label="GSTIN Number" 
                      value={formData.gstin}
                      onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                      error={errors.gstin}
                      placeholder="22AAAAA0000A1Z5" 
                    />
                    <Input 
                      label="FSSAI License" 
                      value={formData.fssai}
                      onChange={(e) => handleChange("fssai", e.target.value)}
                      placeholder="License Number"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Timings & Description */}
              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader title="Details & Timings" subtitle="Operational hours and description" icon={<Clock />} />
                  
                  {/* Timings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                        label="Opening Time" 
                        type="time" 
                        value={formData.openTime} 
                        onChange={(e) => handleChange("openTime", e.target.value)} 
                    />
                    <Input 
                        label="Closing Time" 
                        type="time" 
                        value={formData.closeTime} 
                        onChange={(e) => handleChange("closeTime", e.target.value)} 
                    />
                  </div>

                  {/* Description Box with AI Button */}
                  <div className="relative pt-2">
                    <div className="flex justify-between items-end mb-1.5 px-1">
                      <label className="text-sm font-bold text-slate-800">Short Description</label>
                      <button 
                        type="button"
                        onClick={() => alert("AI Writer coming soon!")}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-[#471396] bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors border border-purple-100"
                      >
                        <Sparkles className="w-3 h-3" />
                        Write with AI
                      </button>
                    </div>
                    
                    <textarea 
                        className={`
                          w-full px-4 py-4 bg-slate-50 border rounded-xl outline-none transition-all h-32 resize-none
                          text-slate-700 font-semibold placeholder:text-gray-400 placeholder:font-medium
                          ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#2E0561]"}
                        `}
                        placeholder="e.g. Authentic flavors from Punjab, serving fresh dishes since 1995."
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                    {errors.description && <span className="text-xs text-red-600 font-bold ml-1">{errors.description}</span>}
                  </div>
                </div>
              )}

              {/* Step 6: Menu Only */}
              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Restaurant Menu" subtitle="Upload your menu card" icon={<MenuIcon />} />
                  <div className="max-w-xl mx-auto">
                    <div 
                      onClick={() => menuInputRef.current?.click()} 
                      className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer group flex flex-col items-center justify-center min-h-[300px] relative border-slate-300 hover:border-[#FFCC00] hover:bg-yellow-50 transition-colors"
                    >
                       <input type="file" ref={menuInputRef} onChange={handleMenuUpload} accept=".pdf,.jpg" className="hidden" />
                       <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                          {formData.menuFile ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <MenuIcon className="w-8 h-8 text-[#FFCC00]" />}
                       </div>
                       
                       {formData.menuFile ? (
                        <>
                          <span className="text-slate-900 font-bold text-xl">Menu Attached</span>
                          <p className="text-sm text-green-700 font-medium mt-2">{formData.menuFile.name}</p>
                          <button type="button" className="mt-8 text-xs font-bold text-green-800 bg-green-100 px-6 py-2 rounded-full uppercase tracking-wide">Change File</button>
                        </>
                       ) : (
                        <>
                          <span className="text-slate-900 font-bold text-xl">Upload Menu</span>
                          <p className="text-sm text-slate-500 mt-3 px-8 leading-relaxed">Supported formats: PDF, JPG, PNG.</p>
                          <span className="mt-8 text-xs font-bold text-slate-900 bg-[#FFCC00] px-6 py-3 rounded-full shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">Browse Files</span>
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
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Back
              </button>
            ) : <div />}
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-8 py-3 bg-[#FFCC00] text-[#2E0561] font-bold rounded-lg hover:bg-[#ffdb4d] flex items-center gap-2 shadow-lg shadow-yellow-500/20"
            >
              {isSubmitting ? "Registering..." : (step === totalSteps ? "Complete Registration" : "Continue")}
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
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
      <label className="text-sm font-bold text-slate-800 ml-1">
        {label}
      </label>
      <input 
        className={`
          w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all
          text-slate-700 font-semibold 
          placeholder:text-gray-400 placeholder:font-medium
          ${error ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#2E0561]"}
          ${className}
        `}
        {...props} 
      />
      {error && <span className="text-xs text-red-600 font-bold ml-1">{error}</span>}
    </div>
  );
}