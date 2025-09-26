import { useState } from 'react'

export const useTwitterDemo = () => {
  const [demoInput, setDemoInput] = useState('')
  const [generatedThread, setGeneratedThread] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/twitter-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: demoInput, contentType: 'text' })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Poll for results with timeout
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/twitter-thread?trackingId=${data.trackingId}`)
            const statusData = await statusResponse.json()

            if (statusData.status === 'completed') {
              clearInterval(pollInterval)
              setGeneratedThread(statusData.thread || '')
              setIsGenerating(false)
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval)
              setError(statusData.error || 'Generation failed')
              setIsGenerating(false)
            }
          } catch (pollError) {
            console.error('Polling error:', pollError)
            clearInterval(pollInterval)
            setError('Failed to check generation status')
            setIsGenerating(false)
          }
        }, 2000)

        // Set timeout to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval)
          if (isGenerating) {
            setError('Generation timed out. Please try again.')
            setIsGenerating(false)
          }
        }, 30000) // 30 second timeout

      } else {
        throw new Error(data.message || 'Generation failed')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setIsGenerating(false)
    }
  }

  const clearDemo = () => {
    setDemoInput('')
    setGeneratedThread('')
    setError(null)
  }

  return {
    demoInput,
    setDemoInput,
    generatedThread,
    isGenerating,
    error,
    handleGenerateThread,
    clearDemo
  }
}
