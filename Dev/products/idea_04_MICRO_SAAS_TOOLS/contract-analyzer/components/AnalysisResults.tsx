"use client";

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Download } from 'lucide-react';
import { AnalysisResponse } from '@/app/actions/analyze-contract';
import { generateAnalysisPDF } from '@/lib/pdf-generator';
import Link from 'next/link';

interface AnalysisResultsProps {
  results: AnalysisResponse;
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const { risks, summary } = results;

  const handleDownload = () => {
    generateAnalysisPDF(results);
  };
  
  const counts = useMemo(() => {
    return {
      Critical: risks.filter(r => r.severity === 'Critical').length,
      Medium: risks.filter(r => r.severity === 'Medium').length,
      Low: risks.filter(r => r.severity === 'Low').length,
    };
  }, [risks]);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <XCircle className="w-5 h-5 flex-shrink-0" />;
      case 'Medium': return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
      case 'Low': return <Info className="w-5 h-5 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              Analysis Summary
            </h2>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
                <Download className="w-4 h-4" />
                Download Report (PDF)
            </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
           <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center">
             <span className="text-3xl font-bold text-red-600">{counts.Critical}</span>
             <span className="text-sm font-medium text-red-800 uppercase tracking-wide">Critical Risks</span>
           </div>
           <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 flex flex-col items-center">
             <span className="text-3xl font-bold text-orange-600">{counts.Medium}</span>
             <span className="text-sm font-medium text-orange-800 uppercase tracking-wide">Medium Risks</span>
           </div>
           <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center">
             <span className="text-3xl font-bold text-blue-600">{counts.Low}</span>
             <span className="text-sm font-medium text-blue-800 uppercase tracking-wide">Low Risks</span>
           </div>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {summary}
        </p>
      </div>

      {/* Detailed Risks */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Detailed Findings</h3>
        
        {risks.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center text-green-800">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h4 className="text-lg font-bold mb-2">No Significant Risks Found</h4>
            <p>Great news! We didn't detect any major red flags in this contract based on our scanning criteria.</p>
          </div>
        ) : (
          risks.map((risk, index) => (
            <div 
              key={index} 
              className={`rounded-xl border p-6 transition-all hover:shadow-md ${severityColor(risk.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{severityIcon(risk.severity)}</div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">{risk.category}</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50 border border-black/5 uppercase">
                      {risk.severity} Risk
                    </span>
                  </div>
                  
                  <div className="bg-white/60 p-3 rounded-lg text-sm font-mono text-gray-800 border-l-4 border-current opacity-90">
                    "{risk.clause}"
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-bold block mb-1">Issue:</span>
                      <p>{risk.issue}</p>
                    </div>
                    <div>
                      <span className="font-bold block mb-1">Suggestion:</span>
                      <p>{risk.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-gray-50 border-t p-6 text-center text-sm text-gray-500 rounded-b-xl">
        <p><strong>Legal Notice:</strong> This analysis is provided for informational purposes only and does not constitute legal advice. AI can make mistakes. Always consult with a qualified attorney for final review.</p>
        <Link href="/disclaimer" className="text-blue-600 font-bold hover:underline mt-2 inline-block">View Full Disclosure</Link>
      </div>
    </div>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
