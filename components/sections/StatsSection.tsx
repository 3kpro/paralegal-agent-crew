interface StatItem {
  value: string
  label: string
}

const stats: StatItem[] = [
  {
    value: '10x',
    label: 'Faster Content Creation'
  },
  {
    value: '7+',
    label: 'Content Formats'
  },
  {
    value: '95%',
    label: 'Time Savings'
  },
  {
    value: '500+',
    label: 'Happy Clients'
  }
]

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-tron-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

