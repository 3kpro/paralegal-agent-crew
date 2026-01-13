import React, { useState, useEffect } from 'react';
import { ControlMatrix } from '../components/ControlMatrix';
import { analyzeGaps, GapAnalysisResult } from '../../analysis/gapDetection';
import { Control, Evidence } from '../../models/types';
import { generateEvidencePackage } from '../../exports/packageGenerator';

// Mock Data Loaders (Simulator)
// In real app, these would be API calls
const mockControls: Control[] = [
    { id: 'c1', code: 'CC6.1', title: 'Logical Access Security', description: 'Logical access to system components is managed.', framework: 'SOC2_TYPE_II', requirement: 'Auth required' },
    { id: 'c2', code: 'CC6.8', title: 'System Operations', description: 'System software is secured.', framework: 'SOC2_TYPE_II', requirement: 'Patching' },
    { id: 'c3', code: 'CC8.1', title: 'Change Management', description: 'Changes are authorized.', framework: 'SOC2_TYPE_II', requirement: 'PR Reviews' }
];

const mockEvidence: Evidence[] = [
    { id: 'e1', integrationId: 'aws-1', controlIds: ['c1'], title: 'AWS IAM Policy', description: '', s3Key: '', mediaType: 'json', sizeBytes: 100, hash: '', capturedAt: new Date(), status: 'captured' },
    // Simulate a gap for c2
    { id: 'e3', integrationId: 'gh-1', controlIds: ['c3'], title: 'GitHub Branch Protection', description: '', s3Key: '', mediaType: 'json', sizeBytes: 100, hash: '', capturedAt: new Date(Date.now() - 86400000 * 2), status: 'captured' } // Old evidence
];

export const Dashboard: React.FC = () => {
    const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        // Run analysis on load
        const result = analyzeGaps(mockControls, mockEvidence, 24);
        setAnalysis(result);
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            console.log('Starting export...');
            // In browser context, this would trigger a download. 
            // Since packageGenerator uses fs (Node), this button would technically call an API endpoint.
            // For MVP UI demo, we just simulate the delay.
            await new Promise(r => setTimeout(r, 2000));
            alert('Evidence Package (ZIP) generated successfully!');
        } catch (e) {
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    if (!analysis) return <div className="p-10 text-white">Loading Compliance Engine...</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
            {/* Top Bar */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">CG</div>
                        <span className="font-bold text-lg tracking-tight">ComplianceGhost</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${isExporting ? 'bg-gray-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                        >
                            {isExporting ? 'Packaging...' : 'Export Auditor ZIP 📦'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Compliance Score</h3>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            {analysis.score}%
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Total Controls</h3>
                        <div className="text-3xl font-bold text-white">{analysis.totalControls}</div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Passing Checks</h3>
                        <div className="text-3xl font-bold text-green-400">{analysis.compliantControls}</div>
                    </div>

                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-gray-400 text-sm font-medium mb-1">Critical Gaps</h3>
                        <div className="text-3xl font-bold text-red-400">{analysis.gapCount}</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Control Matrix */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span>Evidence Matrix</span>
                            <span className="text-xs font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">Live</span>
                        </h2>
                        <ControlMatrix controls={mockControls} evidenceStore={mockEvidence} />
                    </div>

                    {/* Right: Action Feed */}
                    <div className="space-y-6">
                         <h2 className="text-xl font-bold">Recommended Actions</h2>
                         <div className="bg-gray-900 rounded-xl border border-gray-800 p-1">
                            {analysis.details.filter(d => d.status === 'gap').map(gap => (
                                <div key={gap.controlId} className="p-4 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                        <div>
                                            <p className="text-sm font-medium text-red-200">Fix Control {gap.controlId}</p>
                                            <p className="text-xs text-gray-400 mt-1">{gap.reason}</p>
                                            <button className="mt-3 text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors">
                                                Trigger Capture ⚡
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {analysis.gapCount === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <span className="text-4xl block mb-2">🎉</span>
                                    No actions needed. You are audit ready!
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
