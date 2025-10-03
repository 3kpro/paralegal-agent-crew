'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Twitter, Linkedin, MessageSquare } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator & Coach",
    company: "@SarahBuildsThings",
    image: "SC", // Using initials as placeholder
    content: "Content Cascade AI saved me 20+ hours per week. I went from posting twice a week to daily, and my engagement tripled. The AI actually learns my voice—incredible!",
    rating: 5,
    platform: "twitter",
    metrics: "10K → 45K followers in 3 months"
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Agency Owner",
    company: "GrowthLab Agency",
    image: "MR",
    content: "We use this for all our clients. TrendPulse™ finds topics our competitors miss, and the content quality is indistinguishable from our senior copywriters. ROI was immediate.",
    rating: 5,
    platform: "linkedin",
    metrics: "$50K new revenue in 6 months"
  },
  {
    name: "Emily Watson",
    role: "SaaS Founder",
    company: "TechFlow Solutions",
    image: "EW",
    content: "I was skeptical about AI content, but this is different. It doesn't just generate—it thinks strategically. My product announcements now get 5x more engagement.",
    rating: 5,
    platform: "twitter",
    metrics: "500% increase in product signups"
  },
  {
    name: "David Kim",
    role: "Newsletter Creator",
    company: "The Marketing Mind",
    image: "DK",
    content: "From 2,000 to 25,000 subscribers in 8 months. The trend discovery is gold—I'm always ahead of what's coming. Best investment I've made in my business.",
    rating: 5,
    platform: "email",
    metrics: "25K subscribers, $8K MRR"
  },
  {
    name: "Rachel Green",
    role: "Business Consultant",
    company: "Strategy & Growth Co",
    image: "RG",
    content: "I went from struggling to post once a week to confidently sharing valuable insights daily. My clients see me as the go-to expert in my field now.",
    rating: 5,
    platform: "linkedin",
    metrics: "3x client inquiries per month"
  },
  {
    name: "Alex Johnson",
    role: "Course Creator",
    company: "LearnBuild Academy",
    image: "AJ",
    content: "The multi-format publishing is genius. One trend becomes a Twitter thread, LinkedIn article, and email newsletter. My course sales increased 400% from better content marketing.",
    rating: 5,
    platform: "email",
    metrics: "$120K course revenue boost"
  }
]

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  email: MessageSquare
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-600" fill="currentColor" />
              <span className="text-sm font-semibold text-yellow-800">
                4.9/5 stars from 500+ creators
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by Creators
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Who Get Results
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of content creators, marketers, and founders who've transformed 
              their content workflow with Content Cascade AI.
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              const PlatformIcon = platformIcons[testimonial.platform as keyof typeof platformIcons]
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-12 h-12 text-gray-400" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-yellow-400" 
                        fill="currentColor" 
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Metrics */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-6">
                    <div className="text-sm font-semibold text-indigo-700">
                      📈 Result: {testimonial.metrics}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.image}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <PlatformIcon className="w-4 h-4" />
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join These Success Stories?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Start creating content that converts with TrendPulse™ discovery, 
                AI Cascade™ generation, and OmniFormat™ publishing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  Start Your Free Trial
                </button>
                <button className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200">
                  View Pricing Plans
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}