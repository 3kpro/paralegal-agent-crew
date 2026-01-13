import React, { useState, useEffect } from 'react';
import { Control, Evidence } from '../../models/types';

interface ControlMatrixProps {
  controls: Control[];
  evidenceStore: Evidence[];
}

export const ControlMatrix: React.FC<ControlMatrixProps> = ({ controls, evidenceStore }) => {
  const [mappings, setMappings] = useState<Record<string, string[]>>({}); // controlId -> evidenceIds

  // Mock initial load
  useEffect(() => {
    // In real app, fetch existing mappings from API
  }, []);

  const getEvidenceForControl = (controlId: string) => {
    const evidenceIds = mappings[controlId] || [];
    return evidenceStore.filter(e => evidenceIds.includes(e.id));
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          SOC 2 Control Matrix
        </h1>
        <p className="text-gray-400 mt-2">Map collected evidence to compliance controls</p>
      </header>

      <div className="grid gap-6">
        {controls.map(control => (
          <div key={control.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 shadow-lg hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm px-2 py-1 rounded bg-blue-900/50 text-blue-300 border border-blue-900">
                    {control.code}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{control.title}</h3>
                </div>
                <p className="text-gray-400 mt-2 text-sm max-w-2xl">{control.description}</p>
              </div>
              <div className="flex items-center gap-2">
                 {/* Status Indicator */}
                 {getEvidenceForControl(control.id).length > 0 ? (
                    <span className="text-green-400 flex items-center gap-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Compliant
                    </span>
                 ) : (
                    <span className="text-red-400 flex items-center gap-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Missing Evidence
                    </span>
                 )}
              </div>
            </div>

            {/* Evidence List */}
            <div className="bg-gray-900/50 rounded p-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Mapped Evidence</h4>
              <div className="space-y-2">
                {getEvidenceForControl(control.id).map(ev => (
                  <div key={ev.id} className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                     <div className="flex items-center gap-3">
                        <span className="text-lg">
                           {ev.mediaType === 'screenshot' ? '📸' : '📄'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{ev.title}</p>
                          <p className="text-xs text-gray-500">Captured: {ev.capturedAt.toLocaleDateString()}</p>
                        </div>
                     </div>
                     <button className="text-xs text-red-400 hover:text-red-300">Unmap</button>
                  </div>
                ))}

                {getEvidenceForControl(control.id).length === 0 && (
                   <p className="text-sm text-gray-500 italic py-2">No evidence mapped yet.</p>
                )}
              </div>
              
              <button className="mt-3 w-full py-2 border border-dashed border-gray-600 text-gray-400 text-sm rounded hover:bg-gray-800 hover:text-white transition-all">
                + Map Existing Evidence
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
