import React from 'react';
import NL2SQLQuery from '@/components/analyst/NL2SQLQuery';

export default function AnalystPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trend Analyst</h1>
        <p className="text-gray-400">Ask natural language questions about your campaign data to get instant insights.</p>
      </div>
      
      <NL2SQLQuery />
    </div>
  );
}
