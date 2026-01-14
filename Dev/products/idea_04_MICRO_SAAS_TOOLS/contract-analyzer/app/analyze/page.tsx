"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisResponse, analyzeContractText } from '@/app/actions/analyze-contract';
import { extractContractText } from '@/app/actions/extract-text';
import { checkUserUsage } from '@/app/actions/check-usage';
import { UserButton } from "@clerk/nextjs";
import MobileNav from '@/components/MobileNav';

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedText(null);
    setAnalysisResults(null);
  };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setAnalysisResults(null); 
        
        try {
            // Step 0: Check Usage
            const usage = await checkUserUsage();
            
            if (!usage.success) throw new Error(usage.error);
            if (!usage.canAnalyze) {
                toast.error("Free limit reached. Please upgrade to Pro.");
                window.location.href = '/pricing';
                return;
            }

            // Step 1: Extract Text
            const formData = new FormData();
            formData.append("file", selectedFile);
            
            const extractionResult = await extractContractText(formData);

        if (!extractionResult.success || !extractionResult.text) {
             throw new Error(extractionResult.error || "Failed to extract text");
        }

        setExtractedText(extractionResult.text);
        toast.success("Document parsed. Starting AI analysis...");

        // Step 2: Analyze with AI
        const analysisResult = await analyzeContractText(extractionResult.text);

        if (analysisResult.success && analysisResult.data) {
             setAnalysisResults(analysisResult.data);
             
             // Step 3: Save to History
             const { saveAnalysis } = await import('@/app/actions/save-analysis');
             await saveAnalysis({
                 fileName: selectedFile.name,
                 fileType: selectedFile.name.split('.').pop() || 'unknown',
                 analysisResults: analysisResult.data
             });

             toast.success("Analysis Complete & Saved!");
        } else {
             throw new Error(analysisResult.error || "AI Analysis Failed");
        }

    } catch (error: any) {
        console.error("Process failed:", error);
        toast.error(error.message || "Something went wrong");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
       {/* Header */}
       <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ContractGuard AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/how-it-works" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              How it Works
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/templates" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Templates
            </Link>

            {analysisResults ? (
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-gray-600 hover:text-blue-600 font-medium mr-4"
              >
                Analyze New Contract
              </button>
            ) : null}
            <UserButton afterSignOutUrl="/" />
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {analysisResults ? "Analysis Results" : "Upload Your Contract"}
          </h1>
          <p className="text-lg text-gray-600">
            {analysisResults 
              ? `We found ${analysisResults.risks.length} potential issues in your ${selectedFile?.name}` 
              : "Our AI will analyze your document and flag potential risks in seconds."
            }
          </p>
        </div>

        {analysisResults ? (
            <div className="animate-fade-in">
                <AnalysisResults results={analysisResults} />
            </div>
        ) : (
            <div className="animate-fade-in-up">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
                    <FileUpload onFileSelect={handleFileSelect} />
                    
                    {selectedFile && !isAnalyzing && (
                        <div className="mt-8 flex flex-col items-center">
                            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl mb-6 border border-blue-100">
                                <Shield className="w-5 h-5" />
                                <span className="font-semibold">{selectedFile.name}</span>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Start AI Analysis
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="text-center text-sm text-gray-400 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-xl inline-block mx-auto mb-8 border border-white/20">
            <p className="flex items-center gap-2 justify-center">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Your data is processed securely with AES-256 bank-level encryption.
            </p>
        </div>
      </main>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <Shield className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 tracking-tight">AI Lawyer at Work...</h2>
          <p className="text-gray-500 mt-2 animate-pulse text-lg">Scanning for high-risk clauses and payment traps</p>
          <div className="mt-12 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
