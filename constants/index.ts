// Application constants

export const COMPANY_INFO = {
  name: '3K Pro Services',
  tagline: 'AI-Powered Content Marketing Platform',
  description: 'Transform any content into complete campaigns with our AI-powered platform',
  email: 'hello@3kproservices.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Ave, Suite 100, City, State 12345'
} as const

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/3kproservices',
  linkedin: 'https://linkedin.com/company/3kproservices',
  facebook: 'https://facebook.com/3kproservices',
  instagram: 'https://instagram.com/3kproservices'
} as const

export const NAVIGATION_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
] as const