import { Button } from "../ui/Button";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "$199",
    description: "Perfect for small businesses getting started",
    features: [
      "Content Cascade (7 formats)",
      "Basic UGC video script",
      "Social media posts",
      "Email campaign draft",
      "24-hour delivery",
    ],
    buttonText: "Get Started",
  },
  {
    name: "Professional",
    price: "$399",
    description: "Everything you need for serious marketing",
    features: [
      "Everything in Starter",
      "Professional UGC video",
      "Multiple video variations",
      "Brand voice training",
      "Priority support",
    ],
    buttonText: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$699",
    description: "Advanced features for growing teams",
    features: [
      "Everything in Professional",
      "Custom character creation",
      "Advanced analytics",
      "Direct publishing",
      "Dedicated account manager",
    ],
    buttonText: "Contact Sales",
  },
];

interface PricingSectionProps {
  onContactClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onContactClick,
}) => {
  return (
    <section
      id="pricing"
      className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your content creation needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                plan.popular ? "border-blue-600 relative" : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-800 mb-1">
                  {plan.price}
                </div>
                <div className="text-gray-600">per campaign</div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onContactClick}
                variant={plan.popular ? "primary" : "secondary"}
                className="w-full"
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
