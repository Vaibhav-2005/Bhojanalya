// app/register/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Phone, Clock, FileText, 
  ChevronRight, ChevronLeft, User, Image as ImageIcon, 
  AlertCircle, UploadCloud, Menu as MenuIcon, CheckCircle2, X
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    restaurantName: string; cuisine: string;
    ownerName: string; email: string; phone: string;
    address: string; city: string; zip: string;
    gstin: string; fssai: string;
    openTime: string; closeTime: string;
    restaurantImages: FileList | null; 
    menuFile: File | null;
  }>({
    restaurantName: "", cuisine: "",
    ownerName: "", email: "", phone: "",
    address: "", city: "", zip: "",
    gstin: "", fssai: "",
    openTime: "", closeTime: "",
    restaurantImages: null,
    menuFile: null,
  });

  // --- Validation Logic ---
  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};

    if (currentStep === 1) {
      if (!formData.restaurantName) newErrors.restaurantName = "Restaurant name is required";
      if (!formData.cuisine) newErrors.cuisine = "Cuisine type is required";
    }

    if (currentStep === 2) {
      if (!formData.ownerName) newErrors.ownerName = "Owner name is required";
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "Valid 10-digit mobile number required";
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    }

    if (currentStep === 4) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gstin && !gstRegex.test(formData.gstin)) {
        newErrors.gstin = "Invalid GSTIN format";
      }
    }

    // Step 6 Validation (Mandatory Files)
    if (currentStep === 6) {
      if (!formData.restaurantImages || formData.restaurantImages.length === 0) {
        newErrors.restaurantImages = "At least one restaurant photo is required";
      }
      if (!formData.menuFile) {
        newErrors.menuFile = "Restaurant menu file is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Submit Logic
        console.log("Form Submitted", formData);
        alert("Registration Submitted Successfully!");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handlePhoneInput = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, "");
    if (numbersOnly.length <= 10) handleChange("phone", numbersOnly);
  };

  // --- File Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, restaurantImages: e.target.files }));
      if (errors.restaurantImages) setErrors(prev => ({ ...prev, restaurantImages: "" }));
    }
  };

  const handleMenuUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, menuFile: e.target.files![0] }));
      if (errors.menuFile) setErrors(prev => ({ ...prev, menuFile: "" }));
    }
  };

  const triggerImageInput = () => imageInputRef.current?.click();
  const triggerMenuInput = () => menuInputRef.current?.click();

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${inter.className}`}>
      
      {/* Header Area */}
      <div className="bg-[#2E0561] pt-32 pb-48 px-6 text-center text-white relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Register Your Restaurant</h1>
        <p className="text-purple-200 max-w-lg mx-auto text-lg mb-8">
          Join the Bhojanalya network. Let's get you set up in minutes.
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step ? "w-8 bg-[#FFCC00]" : 
                i + 1 < step ? "w-2 bg-[#FFCC00]" : "w-2 bg-purple-800"
              }`} 
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
                      placeholder="e.g. North Indian, Italian" 
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Owner Details */}
              {step === 2 && (
                <div className="space-y-8">
                  <StepHeader title="Owner Details" subtitle="Who is the primary contact?" icon={<User />} />
                  <Input 
                    label="Owner Full Name" 
                    value={formData.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    error={errors.ownerName}
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
                      label="Email Address" 
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      error={errors.email}
                      type="email" 
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
                    />
                    <Input label="State" placeholder="State" />
                    <Input 
                      label="Zip Code" 
                      value={formData.zip}
                      onChange={(e) => handleChange("zip", e.target.value)}
                      maxLength={6}
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
                      helperText="Format: 15 alphanumeric characters"
                    />
                    <Input 
                      label="FSSAI License" 
                      value={formData.fssai}
                      onChange={(e) => handleChange("fssai", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Timings */}
              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader title="Timings" subtitle="When are you open?" icon={<Clock />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Opening Time" type="time" />
                    <Input label="Closing Time" type="time" />
                  </div>
                </div>
              )}

              {/* Step 6: Branding & Menu (UPDATED) */}
              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Photos & Menu" subtitle="Showcase your restaurant" icon={<ImageIcon />} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. Restaurant Images Upload */}
                    <div 
                      onClick={triggerImageInput}
                      className={`
                        border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[240px] relative
                        ${errors.restaurantImages ? "border-red-300 bg-red-50 hover:bg-red-50" : ""}
                        ${formData.restaurantImages ? "border-green-300 bg-green-50 hover:bg-green-100" : "border-slate-200 hover:border-purple-500 hover:bg-purple-50"}
                      `}
                    >
                      <input 
                        type="file" 
                        ref={imageInputRef} 
                        onChange={handleImageUpload} 
                        multiple 
                        accept="image/*"
                        className="hidden" 
                      />
                      
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm border transition-transform group-hover:scale-110 ${formData.restaurantImages ? "bg-green-100 border-green-200" : "bg-white border-slate-100"}`}>
                        {formData.restaurantImages ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <ImageIcon className="w-7 h-7 text-purple-600" />}
                      </div>
                      
                      {formData.restaurantImages ? (
                        <>
                          <span className="text-green-800 font-bold text-lg">Photos Selected</span>
                          <p className="text-xs text-green-600 mt-2">{formData.restaurantImages.length} file(s) ready to upload</p>
                          <button type="button" className="mt-6 text-xs font-bold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-full">Change Photos</button>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-700 font-bold text-lg">Restaurant Photos</span>
                          <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">Upload shots of interior, exterior, or your best dishes.</p>
                          <span className="mt-6 text-xs font-bold text-purple-700 bg-purple-100 px-4 py-2 rounded-full group-hover:bg-purple-200 transition-colors">Browse Gallery</span>
                        </>
                      )}

                      {/* Error Message */}
                      {errors.restaurantImages && (
                        <div className="absolute bottom-4 flex items-center gap-1 text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs font-bold">{errors.restaurantImages}</span>
                        </div>
                      )}
                    </div>

                    {/* 2. Menu Card Upload */}
                    <div 
                      onClick={triggerMenuInput}
                      className={`
                        border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[240px] relative
                        ${errors.menuFile ? "border-red-300 bg-red-50 hover:bg-red-50" : ""}
                        ${formData.menuFile ? "border-green-300 bg-green-50 hover:bg-green-100" : "border-slate-200 hover:border-[#FFCC00] hover:bg-yellow-50"}
                      `}
                    >
                      <input 
                        type="file" 
                        ref={menuInputRef} 
                        onChange={handleMenuUpload} 
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden" 
                      />

                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm border transition-transform group-hover:scale-110 ${formData.menuFile ? "bg-green-100 border-green-200" : "bg-white border-slate-100"}`}>
                        {formData.menuFile ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <MenuIcon className="w-7 h-7 text-[#FFCC00]" />}
                      </div>

                      {formData.menuFile ? (
                        <>
                          <span className="text-green-800 font-bold text-lg">Menu Attached</span>
                          <p className="text-xs text-green-600 mt-2 truncate max-w-[200px]">{formData.menuFile.name}</p>
                          <button type="button" className="mt-6 text-xs font-bold text-green-700 bg-white border border-green-200 px-4 py-2 rounded-full">Change File</button>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-700 font-bold text-lg">Restaurant Menu</span>
                          <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">Upload your full menu. Supported formats: PDF, JPG, PNG.</p>
                          <span className="mt-6 text-xs font-bold text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full group-hover:bg-yellow-200 transition-colors">Browse Files</span>
                        </>
                      )}

                       {/* Error Message */}
                       {errors.menuFile && (
                        <div className="absolute bottom-4 flex items-center gap-1 text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs font-bold">{errors.menuFile}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* --- Navigation Buttons --- */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="px-6 py-3 text-slate-500 font-semibold hover:text-[#2E0561] hover:bg-slate-100 rounded-lg transition-all"
              >
                Back
              </button>
            ) : <div />}

            <button 
              type="submit"
              className="px-8 py-3 bg-[#FFCC00] text-[#2E0561] font-semibold rounded-lg hover:bg-[#ffdb4d] active:scale-[0.98] transition-all flex items-center gap-2"
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

function StepHeader({ title, subtitle, icon }: { title: string, subtitle: string, icon: any }) {
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
  helperText?: string;
}

function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 ml-1">
        {label}
      </label>
      <input 
        className={`
          w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all
          text-slate-900 placeholder:text-slate-400 font-medium
          ${error 
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/50" 
            : "border-slate-200 focus:border-[#2E0561] focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300"
          }
        `}
        {...props}
      />
      {helperText && !error && <span className="text-xs text-slate-400 ml-1">{helperText}</span>}
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 ml-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}