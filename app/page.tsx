'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3K</span>
              </div>
              <span className="text-xl font-bold text-gray-800">3K Pro Services</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-medium">✨ AI-Powered Content Creation</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Any Content Into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Complete Campaigns</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Upload once, generate everywhere. Get professional UGC videos, social posts, email campaigns, and more from a single piece of content.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
                  Start Free Trial →
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
                  ▶ Watch Demo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-1">✓</span>
                  Setup in minutes
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="mb-4">
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 text-2xl">▶</span>
                      </div>
                      <p className="text-sm text-gray-600">Demo Video Preview</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Campaign Generation</span>
                    <span className="text-sm font-semibold text-green-600">Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>✓ Twitter Thread</div>
                    <div>✓ LinkedIn Post</div>
                    <div>✓ Email Campaign</div>
                    <div>✓ UGC Video</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-2">10x</div>
              <div className="text-gray-600">Faster Content Creation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-2">7+</div>
              <div className="text-gray-600">Content Formats</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-2">95%</div>
              <div className="text-gray-600">Time Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800 mb-2">500+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              One Upload. Complete Campaign.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload any content and watch our AI transform it into a coherent, 
              multi-channel campaign that maintains your brand voice across all platforms.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">▶</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Professional UGC Videos</h3>
              <p className="text-gray-600">AI-generated user-generated-style videos with consistent characters and professional quality.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Social Media Posts</h3>
              <p className="text-gray-600">Platform-optimized content for Twitter, LinkedIn, Instagram, and Facebook with proper formatting.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Email Campaigns</h3>
              <p className="text-gray-600">Complete email sequences with subject lines, preview text, and engaging body content.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">SEO Content</h3>
              <p className="text-gray-600">Search-optimized blog posts, FAQ sections, and meta descriptions for better visibility.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Brand Consistency</h3>
              <p className="text-gray-600">All content maintains your unique brand voice and messaging across every channel.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Campaign Analytics</h3>
              <p className="text-gray-600">Track performance across all channels and optimize future campaigns for better results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your content creation needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Perfect for small businesses getting started</p>
                <div className="text-4xl font-bold text-gray-800 mb-1">$199</div>
                <div className="text-gray-600">per campaign</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Content Cascade (7 formats)</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Basic UGC video script</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Social media posts</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Email campaign draft</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">24-hour delivery</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-all duration-200">
                Get Started
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Professional</h3>
                <p className="text-gray-600 mb-4">Everything you need for serious marketing</p>
                <div className="text-4xl font-bold text-gray-800 mb-1">$399</div>
                <div className="text-gray-600">per campaign</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Everything in Starter</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Professional UGC video</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Multiple video variations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Brand voice training</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200">
                Start Free Trial
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">Advanced features for growing teams</p>
                <div className="text-4xl font-bold text-gray-800 mb-1">$699</div>
                <div className="text-gray-600">per campaign</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Custom character creation</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Direct publishing</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-600">Dedicated account manager</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-all duration-200">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Content Marketing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of businesses already using AI to create better content faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3K</span>
                </div>
                <span className="text-xl font-bold">3K Pro Services</span>
              </div>
              <p className="text-gray-400">
                AI-powered content marketing platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 3K Pro Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}