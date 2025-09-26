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
  const hoverClasses = hover
    ? 'hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1'
    : ''

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
