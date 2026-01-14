"use client";

import { useState } from 'react';
import { Search, Filter, FileText, Download, Eye, Crown, Lock } from 'lucide-react';
import { generateTemplatePDF } from '@/lib/pdf-generator';
import { toast } from 'sonner';

interface Template {
    id: string;
    name: string;
    category: string;
    description: string;
    file_url: string;
    is_premium: boolean;
}

interface TemplateBrowserProps {
    templates: Template[];
    userStatus: string;
}

export default function TemplateBrowser({ templates, userStatus }: TemplateBrowserProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                             t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || t.category === category;
        return matchesSearch && matchesCategory;
    });

    const isPro = userStatus === 'pro_monthly' || userStatus === 'pro_lifetime';

    const handlePreview = async (template: Template) => {
        if (template.is_premium && !isPro) {
            toast.error("Upgrade to Pro to access this premium template.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(template.file_url);
            const text = await response.text();
            setPreviewContent(text);
            setPreviewTitle(template.name);
        } catch (error) {
            toast.error("Failed to load template preview.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (template: Template) => {
        if (template.is_premium && !isPro) {
            toast.error("Upgrade to Pro to download this premium template.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(template.file_url);
            const text = await response.text();
            generateTemplatePDF(template.name, text, `${template.name.replace(/\s+/g, '_')}.pdf`);
            toast.success("Download started!");
        } catch (error) {
            toast.error("Download failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search templates..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select 
                        className="w-full md:w-48 p-2 border border-gray-200 rounded-lg outline-none"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <div 
                        key={template.id} 
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            {template.is_premium && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-bold ring-1 ring-amber-200">
                                    <Crown className="w-3 h-3" />
                                    PRO
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                            {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePreview(template)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                            <button 
                                onClick={() => handleDownload(template)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {template.is_premium && !isPro ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {previewContent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-900">{previewTitle}</h2>
                            <button 
                                onClick={() => setPreviewContent(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 font-serif text-lg leading-relaxed text-gray-800 bg-white whitespace-pre-wrap">
                            {previewContent}
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setPreviewContent(null)}
                                className="px-6 py-2 font-semibold text-gray-600 hover:text-gray-900"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    const template = templates.find(t => t.name === previewTitle);
                                    if (template) handleDownload(template);
                                }}
                                className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
