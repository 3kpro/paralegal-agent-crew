import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Globe, FileText, Users, Target, CloudArrowUp as UploadCloud, X, Info, ShieldCheck as Shield, CaretRight as ChevronRight, CaretLeft as ChevronLeft, Check, MagicWand, Megaphone, TrendUp as TrendingUp, Star, Clock, Question as HelpCircle, ArrowsLeftRight as ArrowRightLeft, Camera } from "@phosphor-icons/react";
import { PromoteData, DriveFile } from "../types";
import useDrivePicker from 'react-google-drive-picker';

interface PromoteInputProps {
  data: PromoteData;
  onChange: (data: PromoteData) => void;
  onBack: () => void;
  onComplete: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function PromoteInput({ data, onChange, onBack, onComplete, currentStep, onStepChange }: PromoteInputProps) {
  const [openPicker, authResponse] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || "",
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || "",
      viewId: "DOCS",
      token: authResponse?.access_token,
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (res) => {
        if (res.action === 'picked') {
          const newFiles: DriveFile[] = res.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            embedUrl: doc.embedUrl,
            mimeType: doc.mimeType,
            iconUrl: doc.iconUrl,
            url: doc.url
          }));
          handleChange("driveFiles", [...(data.driveFiles || []), ...newFiles]);
        }
      },
    });
  };

  // Capture access token to allow backend to fetch file content
  React.useEffect(() => {
    if (authResponse?.access_token && data.accessToken !== authResponse.access_token) {
      handleChange("accessToken", authResponse.access_token);
    }
  }, [authResponse, data.accessToken]);


  const handleChange = (field: keyof PromoteData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const steps = [
    { id: "product", title: "Product Info", icon: Package },
    { id: "focus", title: "Campaign Angle", icon: MagicWand },
    { id: "url", title: "Landing Page", icon: Globe },
    { id: "description", title: "Value Prop", icon: FileText },
    { id: "features", title: "Key Features", icon: Target },
    { id: "audience", title: "Audience", icon: Users },
    { id: "media", title: "Media Assets", icon: UploadCloud },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Product
        return data.productName && data.productName.trim() !== "";
      case 1: // Focus
        return data.contentFocus && data.contentFocus !== "";
      case 3: // Description
        return data.description && data.description.trim() !== "";
      default:
        return true; // Other steps are optional or have defaults
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-tron-cyan">
             Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-tron-text-muted">
             {steps[currentStep].title}
          </span>
        </div>
        <div className="w-full h-2 bg-tron-grid rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-tron-cyan to-tron-magenta"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="space-y-6"
        >
          {currentStep === 0 && (
            <div className="space-y-6">
               <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <Package className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  What are you promoting?
               </h3>
               {/* Product Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text-muted">
                  Product / Service Name <span className="text-tron-magenta">*</span>
                </label>
                <input
                  type="text"
                  value={data.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  placeholder="e.g. Acme Dashboard Pro, Summer Sale..."
                  className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50"
                  autoFocus
                />
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text-muted">
                  Type
                </label>
                <select
                  value={data.productType}
                  onChange={(e) => handleChange("productType", e.target.value)}
                  className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text"
                >
                  <option value="product">Physical/Digital Product</option>
                  <option value="service">Service / Consulting</option>
                  <option value="saas">SaaS / App / Platform</option>
                  <option value="content">Content / Course / Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <MagicWand className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  What's the angle?
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {[
                   { id: "launch", label: "Product Launch", icon: Megaphone, desc: "Announce something new" },
                   { id: "feature", label: "Feature Highlight", icon: Star, desc: "Showcase separate capability" },
                   { id: "success", label: "Customer Success", icon: TrendingUp, desc: "Testimonials & case studies" },
                   { id: "offer", label: "Limited Time Offer", icon: Clock, desc: "Urgency and scarcity" },
                   { id: "explainer", label: "How It Works", icon: HelpCircle, desc: "Process & demonstrations" },
                   { id: "problem_solution", label: "Problem → Solution", icon: Check, desc: "Pain point resolution" },
                   { id: "bts", label: "Behind the Scenes", icon: Camera, desc: "Authenticity & process" },
                   { id: "comparison", label: "Comparison", icon: ArrowRightLeft, desc: "Why we are better" },
                 ].map((option) => (
                   <button
                     key={option.id}
                     onClick={() => handleChange("contentFocus", option.id)}
                     className={`p-4 rounded-xl border text-left transition-all ${
                       data.contentFocus === option.id
                         ? "bg-tron-cyan/10 border-tron-cyan text-tron-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                         : "bg-tron-dark/30 border-tron-grid hover:border-tron-cyan/50 hover:bg-tron-dark/50 text-tron-text-muted hover:text-tron-text"
                     }`}
                   >
                     <div className="flex items-center gap-3 mb-1">
                        <option.icon className={`w-5 h-5 ${data.contentFocus === option.id ? "text-tron-cyan" : "text-tron-text-muted"}`} weight="duotone" />
                        <span className="font-semibold">{option.label}</span>
                     </div>
                     <p className="text-xs opacity-70 ml-8">{option.desc}</p>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <Globe className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  Where can people find it?
               </h3>
               {/* Website URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text-muted">
                  Landing Page URL (Optional)
                </label>
                <input
                  type="url"
                  value={data.websiteUrl || ""}
                  onChange={(e) => handleChange("websiteUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50"
                  autoFocus
                />
                <p className="text-xs text-tron-text-muted">
                    We'll include this link in your generated posts.
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
             <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <FileText className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  Describe your offer
               </h3>
              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text-muted">
                  Description / Value Proposition <span className="text-tron-magenta">*</span>
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe what you are promoting. What problem does it solve? Why strictly this?"
                  rows={6}
                  className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50 resize-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <Target className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  What makes it special?
               </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Key Features */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tron-text-muted">
                    Key Features (One per line)
                  </label>
                  <textarea
                     value={data.keyFeatures.join("\n")}
                     onChange={(e) => handleChange("keyFeatures", e.target.value.split("\n"))}
                     placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                     rows={4}
                     className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50 resize-none"
                  />
                </div>

                {/* Unique Selling Points */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tron-text-muted">
                    Unique Selling Points (One per line)
                  </label>
                  <textarea
                     value={data.uniqueSellingPoints.join("\n")}
                     onChange={(e) => handleChange("uniqueSellingPoints", e.target.value.split("\n"))}
                     placeholder="Why buy from you?&#10;Competitive advantage&#10;Guarantees"
                     rows={4}
                     className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
             <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <Users className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  Who is this for?
               </h3>
              
              {/* Audience Presets */}
              <div className="space-y-3">
                 <label className="text-sm font-medium text-tron-text-muted">
                    Quick Select
                 </label>
                 <div className="flex flex-wrap gap-2">
                    {[
                      "Professionals", 
                      "Small Business Owners", 
                      "Entrepreneurs", 
                      "Marketers", 
                      "Developers", 
                      "Creatives", 
                      "Students", 
                      "Gen Z", 
                      "Parents",
                      "Remote Workers"
                    ].map((audi) => {
                       const currentAudiences = data.targetAudience
                         .split(",")
                         .map(s => s.trim())
                         .filter(s => s !== "");
                       
                       const isSelected = currentAudiences.includes(audi);
                       
                       return (
                         <button
                           key={audi}
                           type="button"
                           onClick={() => {
                             let newAudiences;
                             if (isSelected) {
                               newAudiences = currentAudiences.filter(a => a !== audi);
                             } else {
                               newAudiences = [...currentAudiences, audi];
                             }
                             handleChange("targetAudience", newAudiences.join(", "));
                           }}
                           className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                             isSelected
                               ? "bg-tron-cyan/20 border-tron-cyan text-tron-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                               : "bg-tron-dark/30 border-tron-grid text-tron-text-muted hover:border-tron-cyan/50 hover:text-tron-text"
                           }`}
                         >
                            {audi}
                         </button>
                       );
                    })}
                 </div>
              </div>

              {/* Target Audience Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text-muted">
                  Detailed Definition
                </label>
                <input
                  type="text"
                  value={data.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  placeholder="e.g. Busy professionals, Gamers, Parents..."
                  className="w-full px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50"
                  autoFocus
                />
                <p className="text-xs text-tron-text-muted">
                   You can select multiple presets or type your own custom audience segments separated by commas.
                </p>
              </div>
            </div>
          )}

          {currentStep === 6 && (
             <div className="space-y-6">
                <h3 className="text-xl font-semibold text-tron-text flex items-center gap-2">
                  <UploadCloud className="w-6 h-6 text-tron-cyan" weight="duotone" />
                  Media Assets
               </h3>
               
               <div className="flex items-center gap-1 text-xs text-tron-cyan/80 bg-tron-cyan/10 px-2 py-1 rounded-full w-fit">
                    <Shield className="w-3 h-3" weight="duotone" />
                    <span>Zero Storage Policy</span>
                </div>

              {/* User Guidance Banner */}
              <div className="bg-tron-cyan/5 border border-tron-cyan/20 rounded-xl p-4 text-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-50">
                      <Info className="w-16 h-16 text-tron-cyan/5" weight="duotone" />
                  </div>
                  <div className="relative z-10 flex items-start gap-3">
                      <Info className="w-5 h-5 text-tron-cyan shrink-0 mt-0.5" weight="duotone" />
                      <div className="space-y-3">
                          <p className="font-semibold text-tron-text">How Xelora analyzes your media</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-tron-dark/30 rounded-lg p-3 border border-tron-cyan/10">
                                  <p className="text-tron-cyan font-medium mb-1 text-xs uppercase tracking-wider">Option 1: Google Drive</p>
                                  <p className="text-tron-text-muted text-xs leading-relaxed">
                                      Paste a link to a Drive folder. Xelora indexes metadata <span className="text-tron-text">without moving your files</span>. Best for large asset libraries.
                                  </p>
                              </div>
                              <div className="bg-tron-dark/30 rounded-lg p-3 border border-tron-cyan/10">
                                  <p className="text-tron-cyan font-medium mb-1 text-xs uppercase tracking-wider">Option 2: Direct Upload</p>
                                  <p className="text-tron-text-muted text-xs leading-relaxed">
                                      Drag & drop for quick tasks. Files are processed instantly and <span className="text-tron-text">discarded immediately</span> after analysis.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* Google Drive Integration */}
                <div className="space-y-4">
                  <label className="text-xs text-tron-text-muted ml-1 font-medium">Google Drive Integration</label>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleOpenPicker}
                      className="flex-1 px-4 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl hover:bg-tron-cyan/10 hover:border-tron-cyan/50 transition-all flex items-center justify-center gap-2 group"
                    >
                       <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" alt="Drive" className="w-4 h-4" />
                       </div>
                       <span className="text-sm font-medium text-tron-text group-hover:text-tron-cyan">Select from Drive</span>
                    </button>
                    
                    <div className="flex-1 relative">
                       <input
                          type="url"
                          value={data.driveLink || ""}
                          onChange={(e) => handleChange("driveLink", e.target.value)}
                          placeholder="Or paste folder link..."
                          className="w-full pl-4 pr-10 py-3 bg-tron-dark/50 border border-tron-cyan/30 rounded-xl focus:ring-2 focus:ring-tron-cyan/50 focus:border-tron-cyan text-tron-text placeholder-tron-text-muted/50 text-sm"
                      />
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tron-cyan/50">
                          <Globe className="w-4 h-4" weight="duotone" />
                      </div>
                    </div>
                  </div>

                  {data.driveFiles && data.driveFiles.length > 0 && (
                     <div className="bg-tron-dark/30 rounded-xl p-3 border border-tron-cyan/10 space-y-2">
                        <p className="text-xs font-semibold text-tron-text-muted uppercase tracking-wide px-1">Selected from Drive:</p>
                        {data.driveFiles.map((file) => (
                           <div key={file.id} className="flex items-center justify-between p-2 bg-tron-grid/30 rounded-lg border border-tron-cyan/10">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <img src={file.iconUrl} alt="" className="w-4 h-4" />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm text-tron-text truncate">{file.name}</span>
                                    <span className="text-[10px] text-tron-text-muted truncate">ID: {file.id}</span>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => {
                                      const newFiles = data.driveFiles?.filter(f => f.id !== file.id);
                                      handleChange("driveFiles", newFiles);
                                  }}
                                  className="p-1 text-tron-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                  <X className="w-4 h-4" weight="duotone" />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}

                  <p className="text-xs text-tron-text-muted/70 flex items-center gap-1.5 ml-1">
                     <Shield className="w-3 h-3 text-tron-cyan" weight="duotone" />
                     Files are indexed remotely. No content is stored on our servers.
                  </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-tron-grid"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-tron-dark px-2 text-tron-text-muted">Or upload directly</span>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-tron-cyan/30 rounded-xl p-6 text-center bg-tron-dark/30 hover:bg-tron-cyan/5 hover:border-tron-cyan/50 transition-all cursor-pointer relative group">
                  <input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={(e) => {
                          if (e.target.files) {
                              const files = Array.from(e.target.files);
                              handleChange("uploadedFiles", [...(data.uploadedFiles || []), ...files]);
                          }
                      }}
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none relative z-10">
                      <div className="p-3 bg-tron-cyan/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud className="w-6 h-6 text-tron-cyan" weight="duotone" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-tron-text font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-tron-text-muted">Images, Videos, or Documents (Max 50MB)</p>
                      </div>
                  </div>
              </div>

              {/* File List */}
              {data.uploadedFiles && data.uploadedFiles.length > 0 && (
                  <div className="space-y-2 bg-tron-dark/30 p-4 rounded-xl border border-tron-cyan/10">
                      <p className="text-xs font-semibold text-tron-text-muted mb-2 uppercase tracking-wide">Ready for analysis:</p>
                      {data.uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-tron-grid/30 rounded-lg border border-tron-cyan/10 hover:border-tron-cyan/30 transition-colors">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded bg-tron-cyan/10 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4 text-tron-cyan" weight="duotone" />
                                  </div>
                                  <span className="text-sm text-tron-text truncate">{file.name}</span>
                              </div>
                              <button 
                                  onClick={() => {
                                      const newFiles = [...(data.uploadedFiles || [])];
                                      newFiles.splice(idx, 1);
                                      handleChange("uploadedFiles", newFiles);
                                  }}
                                  className="p-1 text-tron-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors type='button'"
                                  title="Remove file"
                              >
                                  <X className="w-4 h-4" weight="duotone" />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
       <div className="flex gap-3 pt-6 border-t border-tron-grid/30">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-tron-grid/50 border-2 border-tron-cyan/30 rounded-2xl font-semibold text-tron-cyan hover:border-tron-cyan hover:bg-tron-cyan/10 transition-all flex items-center gap-2"
          >
             <ChevronLeft className="w-5 h-5" weight="duotone" />
             Back
          </motion.button>
          
          <motion.button
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            whileHover={{ scale: isStepValid(currentStep) ? 1.02 : 1 }}
            whileTap={{ scale: isStepValid(currentStep) ? 0.98 : 1 }}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta rounded-2xl font-semibold text-white shadow-lg shadow-tron-cyan/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {currentStep === steps.length - 1 ? (
                <>
                    Generate Content
                    <ChevronRight className="w-6 h-6" weight="duotone" />
                </>
            ) : (
                <>
                    Next Step
                    <ChevronRight className="w-6 h-6" weight="duotone" />
                </>
            )}
          </motion.button>
        </div>
    </div>
  );
}
