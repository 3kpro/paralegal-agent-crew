"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass as Search, Database, ChartBar as BarChart2, WarningCircle as AlertCircle, Code, CaretDown as ChevronDown, CaretUp as ChevronUp } from '@phosphor-icons/react';
import { LoadingState } from "@/components/LoadingStates";
import dynamic from 'next/dynamic';

const AnalystCharts = dynamic(() => import('./AnalystCharts'), { 
  loading: () => <div className="h-[400px] w-full flex items-center justify-center text-gray-500">Loading visualization...</div>,
  ssr: false 
});

interface NL2SQLQueryProps {
  campaignId?: string;
}

interface QueryResult {
  data: any[];
  sql: string;
  explanation: string;
  chartType: 'bar' | 'line' | 'pie' | 'table' | 'number';
}

export default function NL2SQLQuery({ campaignId }: NL2SQLQueryProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyst/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          campaignId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }

      setResult(data);
    } catch (err: any) {
      console.error('NL2SQL Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render results based on chartType
  const renderResults = () => {
    if (!result || !result.data) return null;

    if (result.data.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
          No data found matching your query.
        </div>
      );
    }

    if (result.chartType === 'number') {
      const value = Object.values(result.data[0])[0];
      const key = Object.keys(result.data[0])[0];
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-900 border border-gray-800 rounded-xl">
          <span className="text-sm text-gray-400 uppercase tracking-widest mb-2">{key.replace(/_/g, ' ')}</span>
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-coral-500 to-amber-500">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>
      );
    }
  
    // Dynamic chart rendering
    if (result.chartType === 'bar' || result.chartType === 'line' || result.chartType === 'pie') {
      return (
        <div className="h-[400px] w-full bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <AnalystCharts data={result.data} type={result.chartType} />
        </div>
      );
    }

    // Default: Table
    const keys = Object.keys(result.data[0]);

    return (
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-gray-800">
              <tr>
                {keys.map((k) => (
                  <th key={k} className="px-6 py-3 font-medium">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {result.data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  {keys.map((k) => (
                    <td key={`${idx}-${k}`} className="px-6 py-4 text-gray-300">
                      {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-coral-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-30" />
        <form onSubmit={handleSearch} className="relative z-10">
          <div className="relative flex items-center bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden focus-within:border-coral-500/50 transition-colors">
            <div className="pl-4 text-gray-500">
              <Search className="w-5 h-5" weight="duotone" />
            </div>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your campaign data... (e.g. 'Show me top performing posts')"
              className="w-full bg-transparent border-none py-4 px-4 text-white placeholder-gray-500 focus:ring-0 text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="mr-2 px-4 py-2 bg-coral-500 hover:bg-coral-400 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ask Analyst
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <LoadingState variant="luma" message="Analyzing data & generating SQL..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-start gap-3 text-red-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" weight="duotone" />
          <div>
            <h4 className="font-medium">Analysis Failed</h4>
            <p className="text-sm opacity-80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Result Display */}
      {result && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Answer Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                  <BarChart2 className="w-5 h-5 text-coral-500" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Analysis Result</h3>
                  <p className="text-sm text-gray-400">{result.explanation}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSql(!showSql)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Code className="w-3 h-3" weight="duotone" />
                {showSql ? 'Hide Query' : 'View SQL'}
                {showSql ? <ChevronUp className="w-3 h-3" weight="duotone" /> : <ChevronDown className="w-3 h-3" weight="duotone" />}
              </button>
            </div>

            {/* SQL Debug View */}
            <AnimatePresence>
              {showSql && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-black rounded-xl border border-gray-800 p-4 font-mono text-xs text-green-400 overflow-x-auto">
                    {result.sql}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Data Visualization */}
            {renderResults()}
          </div>
        </motion.div>
      )}
    </div>
  );
}
