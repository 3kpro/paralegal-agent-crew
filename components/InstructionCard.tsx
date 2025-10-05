'use client'

import { useState } from 'react'

interface InstructionCardProps {
  provider: string
  url: string
  steps: string[]
  timeEstimate: string
  costInfo: string
  keyFormat: string
}

export default function InstructionCard({
  provider,
  url,
  steps,
  timeEstimate,
  costInfo,
  keyFormat
}: InstructionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          📚 How to get your {provider} API key
        </span>
        <span className="text-gray-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
          {/* Steps */}
          <div className="space-y-2 mt-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{step}</span>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">⏱️ Setup time:</span>{' '}
              <span className="text-gray-600">{timeEstimate}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">💰 Cost:</span>{' '}
              <span className="text-gray-600">{costInfo}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">🔑 Key format:</span>{' '}
              <span className="text-gray-600">{keyFormat}</span>
            </div>
          </div>

          {/* Link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            🔗 Open {provider} Platform →
          </a>
        </div>
      )}
    </div>
  )
}