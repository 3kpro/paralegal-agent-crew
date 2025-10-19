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
  const transitionTiming = [0.25, 0.46, 0.45, 0.94]

  return (
    <motion.div 
      className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: transitionTiming }}
      whileHover={
        hover 
          ? {
              boxShadow: '0 0 10px #00ffff',
              border: '1px solid #00ffff',
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
