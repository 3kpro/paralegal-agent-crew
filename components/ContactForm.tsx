'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface FormData {
  name: string
  email: string
  company: string
  message: string
  serviceType: string
  budget: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    serviceType: 'professional',
    budget: '1000-5000'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Tron-inspired animation settings
  const transitionTiming = [0.25, 0.46, 0.45, 0.94]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // This would connect to your n8n webhook
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          serviceType: 'professional',
          budget: '1000-5000'
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  // Custom input component with Tron styling
  const FormInput = ({ 
    label, 
    id, 
    type = 'text', 
    required = false,
    placeholder,
    value,
    name
  }: { 
    label: string
    id: string
    type?: string
    required?: boolean
    placeholder?: string
    value: string
    name: string
  }) => (
    <div>
      <motion.label 
        htmlFor={id} 
        className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          focusedField === name ? 'text-cyan-400' : 'text-tron-text700'
        }`}
        animate={{ color: focusedField === name ? '#00ffff' : '#374151' }}
        transition={{ duration: 0.3, ease: transitionTiming }}
      >
        {label} {required && '*'}
      </motion.label>
      <motion.input
        type={type}
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={handleChange}
        onFocus={() => handleFocus(name)}
        onBlur={handleBlur}
        className="w-full px-4 py-3 border border-tron-grid rounded-lg transition-all duration-300"
        placeholder={placeholder}
        whileFocus={{
          boxShadow: '0 0 0 2px #00ffff',
          borderColor: '#00ffff',
          transition: { duration: 0.3, ease: transitionTiming }
        }}
      />
    </div>
  )

  // Custom select component with Tron styling
  const FormSelect = ({ 
    label, 
    id, 
    options,
    value,
    name
  }: { 
    label: string
    id: string
    options: { value: string, label: string }[]
    value: string
    name: string
  }) => (
    <div>
      <motion.label 
        htmlFor={id} 
        className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
          focusedField === name ? 'text-cyan-400' : 'text-tron-text700'
        }`}
        animate={{ color: focusedField === name ? '#00ffff' : '#374151' }}
        transition={{ duration: 0.3, ease: transitionTiming }}
      >
        {label}
      </motion.label>
      <motion.select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onFocus={() => handleFocus(name)}
        onBlur={handleBlur}
        className="w-full px-4 py-3 border border-tron-grid rounded-lg transition-all duration-300"
        whileFocus={{
          boxShadow: '0 0 0 2px #00ffff',
          borderColor: '#00ffff',
          transition: { duration: 0.3, ease: transitionTiming }
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
    </div>
  )

  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: transitionTiming }}
    >
      <div className="bg-tron-grid rounded-xl shadow-lg p-8 border border-tron-grid">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-tron-text800 mb-4">Get Started Today</h2>
          <p className="text-tron-text600">
            Tell us about your project and we'll create a custom campaign proposal for you.
          </p>
        </div>

        {submitStatus === 'success' && (
          <motion.div 
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: transitionTiming }}
            style={{ boxShadow: '0 0 10px #00ff00' }}
          >
            <span className="text-green-600 mr-3">✅</span>
            <span className="text-green-800">Thank you! We'll get back to you within 24 hours.</span>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: transitionTiming }}
            style={{ boxShadow: '0 0 10px #ff00ff' }}
          >
            <span className="text-red-600 mr-3">❌</span>
            <span className="text-red-800">Something went wrong. Please try again or email us directly.</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Full Name"
              id="name"
              name="name"
              required
              value={formData.name}
              placeholder="John Doe"
            />
            
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              placeholder="john@company.com"
            />
          </div>

          <FormInput
            label="Company Name"
            id="company"
            name="company"
            value={formData.company}
            placeholder="Your Company"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormSelect
              label="Service Interest"
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              options={[
                { value: 'starter', label: 'Starter ($199/campaign)' },
                { value: 'professional', label: 'Professional ($399/campaign)' },
                { value: 'enterprise', label: 'Enterprise ($699/campaign)' },
                { value: 'custom', label: 'Custom Solution' }
              ]}
            />
            
            <FormSelect
              label="Monthly Budget"
              id="budget"
              name="budget"
              value={formData.budget}
              options={[
                { value: '500-1000', label: '$500 - $1,000' },
                { value: '1000-5000', label: '$1,000 - $5,000' },
                { value: '5000-10000', label: '$5,000 - $10,000' },
                { value: '10000+', label: '$10,000+' }
              ]}
            />
          </div>

          <div>
            <motion.label 
              htmlFor="message" 
              className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                focusedField === 'message' ? 'text-cyan-400' : 'text-tron-text700'
              }`}
              animate={{ color: focusedField === 'message' ? '#00ffff' : '#374151' }}
              transition={{ duration: 0.3, ease: transitionTiming }}
            >
              Project Details
            </motion.label>
            <motion.textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              onFocus={() => handleFocus('message')}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border border-tron-grid rounded-lg transition-all duration-300"
              placeholder="Tell us about your content marketing goals, target audience, and any specific requirements..."
              whileFocus={{
                boxShadow: '0 0 0 2px #00ffff',
                borderColor: '#00ffff',
                transition: { duration: 0.3, ease: transitionTiming }
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isSubmitting ? { 
              boxShadow: '0 0 10px #00ffff',
              y: -2,
              transition: { duration: 0.3, ease: transitionTiming }
            } : undefined}
            whileTap={!isSubmitting ? { 
              scale: 0.98,
              boxShadow: '0 0 20px #00ffff, inset 0 0 5px rgba(0,255,255,0.3)',
              transition: { duration: 0.2, ease: transitionTiming }
            } : undefined}
          >
            {isSubmitting ? 'Sending...' : 'Get Custom Proposal'}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-tron-text500">
          <p>We typically respond within 24 hours with a custom proposal.</p>
        </div>
      </div>
    </motion.div>
  )
}
