import { Card } from "../ui/Card";

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

const services: ServiceItem[] = [
  {
    icon: "🎯",
    title: "Viral Score Prediction",
    description:
      "87% accuracy AI model predicts viral potential before you create. Know what will perform before investing time.",
  },
  {
    icon: "📊",
    title: "Social Media Posts",
    description:
      "Platform-optimized content for Twitter, LinkedIn, Instagram, and Facebook with proper formatting.",
  },
  {
    icon: "⏰",
    title: "Email Campaigns",
    description:
      "Complete email sequences with subject lines, preview text, and engaging body content.",
  },
  {
    icon: "📈",
    title: "Trend-Based Generation",
    description:
      "Enter any trending topic and generate viral-optimized content across all platforms instantly.",
  },
  {
    icon: "👥",
    title: "Brand Consistency",
    description:
      "All content maintains your unique brand voice and messaging across every channel.",
  },
  {
    icon: "⭐",
    title: "Campaign Analytics",
    description:
      "Track performance across all channels and optimize future campaigns for better results.",
  },
];

export const ServicesGrid: React.FC = () => {
  return (
    <section
      id="services"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-tron-dark"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-tron-text mb-4">
            One Topic. Viral Campaign.
          </h2>
          <p className="text-xl text-tron-text-muted max-w-3xl mx-auto">
            Enter any trending topic and watch our AI predict viral potential with 87% accuracy,
            then generate optimized content for every platform that maintains your brand voice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-8 text-center bg-tron-grid border-tron-cyan/30"
            >
              <div className="w-16 h-16 bg-tron-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-tron-cyan text-2xl">{service.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-tron-text mb-4">
                {service.title}
              </h3>
              <p className="text-tron-text-muted">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
