import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true
}) => {
  // Tron-inspired animation settings
  const transitionTiming = 'easeInOut'

  return (
    <motion.div 
      className={`bg-tron-grid rounded-xl shadow-lg border border-tron-grid ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: transitionTiming }}
      whileHover={
        hover 
          ? {
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
              borderColor: '#00ffff',
              y: -4,
              transition: { duration: 0.3, ease: transitionTiming }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}
