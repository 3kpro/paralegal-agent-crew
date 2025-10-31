'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Twitter, Linkedin, MessageSquare } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Beta Creator & Coach",
    company: "@SarahBuildsThings",
    image: "SC", // Using initials as placeholder
    content: "TrendPulse™ Beta found 3 viral trends before anyone else. The AI Studio gives me GPT-4 and Claude together—I create 7 days of content in 30 minutes. Game-changing!",
    rating: 5,
    platform: "twitter",
    metrics: "10K → 68K followers during beta"
  },
  {
    name: "Marcus Rodriguez",
    role: "Beta Agency Partner",
    company: "GrowthLab Agency",
    image: "MR",
    content: "ContentFlow™ automation publishes to 6 platforms instantly. Our clients' reach increased 400% since joining the beta. The Brand Voice AI maintains perfect consistency.",
    rating: 5,
    platform: "linkedin",
    metrics: "$180K additional revenue in beta"
  },
  {
    name: "Emily Watson",
    role: "Beta SaaS Founder",
    company: "TechFlow Solutions",
    image: "EW",
    content: "Beta features are incredible. Media Generator™ creates perfect visuals, Analytics Hub™ predicts viral content. My product launches now reach 10x more people.",
    rating: 5,
    platform: "twitter",
    metrics: "1,200% increase in signups"
  },
  {
    name: "David Kim",
    role: "Beta Newsletter Creator",
    company: "The Marketing Mind",
    image: "DK",
    content: "Beta trend detection is unreal—I'm breaking stories 3 days early. Went from 25K to 85K subscribers using beta features. The competitive advantage is massive.",
    rating: 5,
    platform: "email",
    metrics: "85K subscribers, $28K MRR"
  },
  {
    name: "Rachel Green",
    role: "Beta Business Consultant",
    company: "Strategy & Growth Co",
    image: "RG",
    content: "The beta taught me content marketing mastery. 6-platform publishing, viral predictions, automated workflows—I'm booked solid with premium clients now.",
    rating: 5,
    platform: "linkedin",
    metrics: "8x client inquiries per month"
  },
  {
    name: "Alex Johnson",
    role: "Beta Course Creator",
    company: "LearnBuild Academy",
    image: "AJ",
    content: "Beta access gave me first-mover advantage. The automation workflows turn one idea into 20+ pieces of content across platforms. Course sales up 800% since beta launch.",
    rating: 5,
    platform: "email",
    metrics: "$450K revenue increase"
  }
]

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  email: MessageSquare
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-tron-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-6 shadow-lg">
              <Star className="w-4 h-4 text-white" fill="currentColor" />
              <span className="text-sm font-bold text-white">
                4.9/5 stars from 2,500+ beta creators
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-tron-text mb-6">
              Loved by Beta Creators
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Getting Extraordinary Results
              </span>
            </h2>
            
            <p className="text-xl text-tron-text-muted max-w-3xl mx-auto">
              Join 2,500+ beta creators, agencies, and founders who've unlocked next-generation 
              content creation with TrendPulse™ Beta features.
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
                  className="bg-tron-grid rounded-2xl p-8 shadow-lg border border-tron-cyan hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-12 h-12 text-tron-cyan" />
                  </div>

                  {/* Beta Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-tron-cyan to-tron-magenta text-tron-dark rounded-full text-xs font-bold shadow-lg"
                  >
                    BETA TESTER
                  </motion.div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 text-tron-magenta" 
                        fill="currentColor" 
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-tron-text-muted mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Metrics */}
                  <div className="bg-tron-grid rounded-lg p-3 mb-6 border border-tron-cyan">
                    <div className="text-sm font-semibold text-tron-cyan">
                      📈 Result: {testimonial.metrics}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.image}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-tron-text">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-tron-text-muted">
                        {testimonial.role}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-tron-text-muted">
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
            <div className="bg-tron-grid rounded-2xl p-12 border border-tron-cyan">
              <h3 className="text-2xl font-bold text-tron-text mb-4">
                Ready to Join Our Beta Success Stories?
              </h3>
              <p className="text-tron-text-muted mb-8 max-w-2xl mx-auto">
                Get exclusive Beta access to TrendPulse™, AI Studio™, and ContentFlow™ automation. 
                Be among the first to experience next-generation content creation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const element = document.getElementById('contact')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-tron-cyan to-tron-magenta text-tron-dark rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-200"
                >
                  Join Beta Program
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const element = document.getElementById('pricing')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="px-8 py-4 bg-tron-grid border-2 border-tron-cyan text-tron-cyan rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-tron-cyan/10 transform transition-all duration-200"
                >
                  View Beta Access
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}