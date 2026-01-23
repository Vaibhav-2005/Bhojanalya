"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Clock, FileText, 
  ChevronRight, User, CheckCircle2, 
  Menu as MenuIcon, Sparkles, Loader2, UploadCloud
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
  
  // New States for the specific flow
  const [isMenuUploaded, setIsMenuUploaded] = useState(false);
  const [restaurantCreated, setRestaurantCreated] = useState(false);

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
      if (!formData.city) newErrors.city = "City is required"; // ✅ Mandatory
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
    if (restaurantCreated) return; // Don't create twice

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

    await apiRequest('/restaurants', 'POST', payload);
    setRestaurantCreated(true);
  };

  // --- 2. SUBMIT FILE HANDLER (Multipart) ---
  const submitMenuFile = async () => {
    if (!formData.menuFile) return;

    const fileData = new FormData();
    fileData.append("menu_file", formData.menuFile);

    const token = localStorage.getItem('token');
    
    // Using generic endpoint as per backend logic
    const response = await fetch('/menus/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Content-Type handled automatically
      },
      body: fileData
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Menu upload failed");
    }
  };

  // --- SPECIFIC HANDLER: Upload Menu Button ---
  const handleUploadMenu = async () => {
    if (!formData.menuFile) {
      alert("Please select a menu file first.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Restaurant (if not already done)
      setStatusMessage("Saving Profile...");
      await submitRestaurantData();

      // 2. Upload Menu
      setStatusMessage("Uploading Menu...");
      await submitMenuFile();

      // 3. Success State
      setIsMenuUploaded(true);
      setStatusMessage("Done!");
      
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload menu.");
      setIsMenuUploaded(false);
    } finally {
      setIsSubmitting(false);
      setStatusMessage("");
    }
  };

  // --- Navigation Handlers ---
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Final Step: Complete Registration (Only works if menu uploaded)
        if (isMenuUploaded) {
          router.push("/dashboard");
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
      setIsMenuUploaded(false); // Reset upload status if file changes
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

              {/* Step 2: Owner Details */}
              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Owner Details" subtitle="Auto-filled from your account" icon={<User />} />
                  <Input 
                    label="Owner Full Name" 
                    value={formData.ownerName}
                    disabled={true} 
                    className="bg-slate-100 text-slate-500 cursor-not-allowed" 
                  />
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
                    error={errors.address}
                    placeholder="Plot No, Street, Landmark"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input 
                      label="City" 
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      error={errors.city}
                      placeholder="Gurugram"
                    />
                    <Input 
                      label="State" 
                      value={formData.state} 
                      onChange={(e) => handleChange("state", e.target.value)}
                      error={errors.state} 
                      placeholder="Haryana"
                    />
                    <Input 
                      label="Zip Code" 
                      value={formData.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      error={errors.zip}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Opening Time" type="time" value={formData.openTime} onChange={(e) => handleChange("openTime", e.target.value)} />
                    <Input label="Closing Time" type="time" value={formData.closeTime} onChange={(e) => handleChange("closeTime", e.target.value)} />
                  </div>
                  <div className="relative pt-2">
                    <label className="text-sm font-bold text-slate-800 mb-1.5 block">Short Description</label>
                    <textarea 
                        className={`
                          w-full px-4 py-4 bg-slate-50 border rounded-xl outline-none transition-all h-32 resize-none
                          text-slate-600 font-semibold placeholder:text-gray-400 placeholder:font-medium
                          ${errors.description ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#2E0561]"}
                        `}
                        placeholder="e.g. Authentic flavors from Punjab..."
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
                  <div className="max-w-xl mx-auto flex flex-col gap-6">
                    
                    {/* File Selection Area */}
                    <div 
                      onClick={() => !isMenuUploaded && menuInputRef.current?.click()} 
                      className={`
                        border-2 border-dashed rounded-2xl p-10 text-center group flex flex-col items-center justify-center min-h-[250px] relative transition-colors
                        ${isMenuUploaded ? "border-green-200 bg-green-50 cursor-default" : "cursor-pointer border-slate-300 hover:border-[#FFCC00] hover:bg-yellow-50"}
                      `}
                    >
                       <input type="file" ref={menuInputRef} onChange={handleMenuUpload} accept=".pdf,.jpg" className="hidden" disabled={isMenuUploaded} />
                       
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm border ${isMenuUploaded ? "bg-green-100 border-green-200" : "bg-white border-slate-200"}`}>
                          {isMenuUploaded || formData.menuFile ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <MenuIcon className="w-8 h-8 text-[#FFCC00]" />}
                       </div>
                       
                       {formData.menuFile ? (
                        <>
                          <span className="text-slate-900 font-bold text-xl">{isMenuUploaded ? "Upload Successful" : "File Selected"}</span>
                          <p className="text-sm text-green-700 font-medium mt-2">{formData.menuFile.name}</p>
                          {!isMenuUploaded && (
                            <button type="button" className="mt-6 text-xs font-bold text-slate-500 underline hover:text-red-500">Change File</button>
                          )}
                        </>
                       ) : (
                        <>
                          <span className="text-slate-900 font-bold text-xl">Select Menu File</span>
                          <p className="text-sm text-slate-500 mt-3 px-8 leading-relaxed">Supported formats: PDF, JPG, PNG.</p>
                          <span className="mt-8 text-xs font-bold text-slate-900 bg-[#FFCC00] px-6 py-3 rounded-full shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">Browse</span>
                        </>
                       )}
                    </div>

                    {/* NEW: Dedicated Upload Button */}
                    {!isMenuUploaded && formData.menuFile && (
                      <button 
                        type="button"
                        onClick={handleUploadMenu}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xl"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> {statusMessage}</>
                        ) : (
                          <><UploadCloud className="w-5 h-5" /> Upload & Register</>
                        )}
                      </button>
                    )}

                    {isMenuUploaded && (
                      <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
                        🎉 Menu uploaded successfully! You can now complete registration.
                      </div>
                    )}

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
                disabled={isSubmitting} // Lock back button during upload
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : <div />}
            
            <button 
              onClick={handleNextStep}
              disabled={isSubmitting || (step === totalSteps && !isMenuUploaded)}
              className={`
                px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all
                ${(step === totalSteps && !isMenuUploaded) 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-[#FFCC00] text-[#2E0561] hover:bg-[#ffdb4d] shadow-yellow-500/20"}
              `}
            >
              {step === totalSteps ? "Complete Registration" : "Continue"}
              <ChevronRight className="w-4 h-4" />
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
          text-slate-600 font-semibold 
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