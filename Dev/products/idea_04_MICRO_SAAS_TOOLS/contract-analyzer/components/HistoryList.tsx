"use client";

import { useState } from 'react';
import { FileText, Trash2, ExternalLink, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { deleteAnalysis } from '@/app/actions/delete-analysis';
import { toast } from 'sonner';
import { generateAnalysisPDF } from '@/lib/pdf-generator';

interface HistoryListProps {
    initialData: any[];
}

export default function HistoryList({ initialData }: HistoryListProps) {
    const [history, setHistory] = useState(initialData);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this analysis?')) return;

        const result = await deleteAnalysis(id);
        if (result.success) {
            setHistory(h => h.filter(item => item.id !== id));
            toast.success('Analysis deleted');
        } else {
            toast.error('Failed to delete');
        }
    };

    const handleDownload = (item: any) => {
        // Reconstruct the analysis response for the PDF generator
        const results = {
            summary: item.summary,
            risks: item.risks_detected || []
        };
        generateAnalysisPDF(results as any, `Analysis_${item.file_name}.pdf`);
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No analyses yet</h3>
                <p className="text-gray-500 mt-2">Upload your first contract to see it here.</p>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <ShieldCheck className="w-5 h-5" />;
        if (score >= 50) return <Shield className="w-5 h-5" />;
        return <ShieldAlert className="w-5 h-5" />;
    };

    return (
        <div className="grid gap-4">
            {history.map((item) => (
                <div 
                    key={item.id} 
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getScoreColor(item.risk_score)} border`}>
                            {getScoreIcon(item.risk_score)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg truncate max-w-[300px]">
                                {item.file_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="uppercase font-bold">{item.file_type}</span>
                                <span>•</span>
                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="font-medium">Score: {item.risk_score}/100</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => handleDownload(item)}
                            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Report
                        </button>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
