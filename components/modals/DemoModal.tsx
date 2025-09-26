import { Button } from '../ui/Button'
import { useTwitterDemo } from '../../hooks/useTwitterDemo'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const {
    demoInput,
    setDemoInput,
    generatedThread,
    isGenerating,
    error,
    handleGenerateThread,
    clearDemo
  } = useTwitterDemo()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Content Cascade AI Demo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Twitter Thread Generator</h3>
            <p className="text-gray-500 mb-4">Transform any content into engaging Twitter threads</p>

            <form onSubmit={handleGenerateThread} className="space-y-4">
              <textarea
                placeholder="Paste your content here or provide a URL..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                required
              />
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  variant="primary"
                >
                  {isGenerating ? 'Generating...' : 'Generate Twitter Thread'}
                </Button>
                <Button
                  type="button"
                  onClick={clearDemo}
                  variant="secondary"
                >
                  Clear
                </Button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-red-800 mb-2">❌ Error:</h4>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={clearDemo}
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {generatedThread && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-green-800 mb-4">🎉 Generated Twitter Thread:</h4>
            <div className="bg-white rounded border p-4">
              <pre className="whitespace-pre-wrap text-gray-800">{generatedThread}</pre>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => navigator.clipboard.writeText(generatedThread)}
                variant="primary"
                size="sm"
              >
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => window.open('https://twitter.com/compose/tweet', '_blank')}
                variant="outline"
                size="sm"
              >
                Open Twitter
              </Button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📹 UGC Videos</h4>
            <p className="text-sm text-blue-600">Coming Soon</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">📱 Social Posts</h4>
            <p className="text-sm text-green-600">Twitter Threads (Live)</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">📧 Email Campaigns</h4>
            <p className="text-sm text-purple-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
