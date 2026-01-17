// Application constants

export const COMPANY_INFO = {
  name: 'XELORA',
  tagline: 'Predict Momentum. Engineer Virality.',
  description: 'XELORA analyzes emerging signals across platforms to reveal what\'s about to rise—before the internet reacts.',
  email: 'hello@getxelora.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Ave, Suite 100, City, State 12345'
} as const

export const SOCIAL_LINKS = {
  twitter: 'https://x.com/XELORA_APP',
  linkedin: 'https://linkedin.com/company/xelora',
  facebook: 'https://facebook.com/xelora',
  instagram: 'https://instagram.com/xelora_app'
} as const

export const NAVIGATION_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
] as const