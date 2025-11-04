// Common types for the application

export interface ContactFormData {
  name: string
  email: string
  company?: string
  message: string
}

export interface TwitterThreadData {
  topic: string
  tone: 'professional' | 'casual' | 'educational' | 'promotional' | 'humor'
  threadLength: number
  targetAudience?: 'general' | 'entrepreneur' | 'professional' | 'gamer' | 'hobbyist'
  callToAction?: 'visit' | 'learn' | 'sign-up' | 'follow'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface SectionProps {
  className?: string
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}