export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">TrendPulse</h1>
        <p className="text-xl text-gray-600 mb-8">
          Test Page - Build is Working!
        </p>
        <div className="text-sm text-gray-500">
          Build Time: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}
