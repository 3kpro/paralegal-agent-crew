export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">XELORA</h1>
        <p className="text-xl mt-2">
          Turn Trending Topics Into Published Content
        </p>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Simple Landing Page</h2>
          <p className="text-gray-600 mb-8">
            This simplified version confirms the deployment is working.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Get Started
          </button>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">XELORA™</h3>
            <p className="text-gray-600">Discover what's trending</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">AI Cascade™</h3>
            <p className="text-gray-600">Generate professional content</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">OmniFormat™</h3>
            <p className="text-gray-600">Publish everywhere automatically</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 p-6 text-center">
        <p className="text-gray-600">
          © 2024 3K Pro Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
