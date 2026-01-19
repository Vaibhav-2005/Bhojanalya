// app/register-restaurant/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, MapPin, Phone, Clock, FileText, 
  ChevronRight, ChevronLeft, User, Image as ImageIcon, 
  AlertCircle
} from "lucide-react";
import { Inter } from "next/font/google";

// Using Inter font for a clean, elegant look
const inter = Inter({ subsets: ["latin"] });

export default function RegisterRestaurant() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    restaurantName: "", cuisine: "",
    ownerName: "", email: "", phone: "",
    address: "", city: "", zip: "",
    gstin: "", fssai: "",
    openTime: "", closeTime: "",
  });

  // --- Validation Logic ---
  const validateStep = (currentStep: number) => {
    let newErrors: {[key: string]: string} = {};
    let isValid = true;

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
      // GST Regex: 2 digits, 5 letters, 4 digits, 1 letter, 1 number/letter, Z, 1 number/letter
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gstin && !gstRegex.test(formData.gstin)) {
        newErrors.gstin = "Invalid GSTIN format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < totalSteps) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Generic Change Handler
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // Specific Phone Handler (Numbers Only)
  const handlePhoneInput = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, "");
    if (numbersOnly.length <= 10) {
      handleChange("phone", numbersOnly);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${inter.className}`}>
      
      {/* --- Header Area --- */}
      {/* Increased padding-bottom (pb-48) to make the purple area longer */}
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

      {/* --- Form Card --- */}
      {/* Increased negative margin (-mt-32) for significant overlap */}
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
              {/* Step Content Rendering */}
              {step === 1 && (
                <div className="space-y-8">
                  <StepHeader title="General Information" subtitle="Tell us about your establishment" icon={<Utensils />} />
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                    <Input 
                      label="Restaurant Name" 
                      value={formData.restaurantName}
                      onChange={(e) => handleChange("restaurantName", e.target.value)}
                      error={errors.restaurantName}
                      placeholder="e.g. Royal Spice" 
                    />
                    <br />
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

              {step === 5 && (
                <div className="space-y-8">
                  <StepHeader title="Timings" subtitle="When are you open?" icon={<Clock />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Opening Time" type="time" />
                    <Input label="Closing Time" type="time" />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8">
                  <StepHeader title="Branding" subtitle="Upload your logo" icon={<ImageIcon />} />
                   <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <ImageIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-slate-600 font-medium">Click to upload logo</span>
                    <p className="text-sm text-slate-400 mt-2">Maximum file size 5MB</p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* --- Footer / Navigation Buttons --- */}
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