import { Button } from "../ui/Button";

interface HeroSectionProps {
  onDemoClick: () => void;
  onTrialClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onDemoClick,
  onTrialClick,
}) => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-blue-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">
                ✨ AI-Powered Content Creation
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform Any Content Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {" "}
                Complete Campaigns
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Upload once, generate everywhere. Get professional UGC videos,
              social posts, email campaigns, and more from a single piece of
              content.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button onClick={onTrialClick} variant="primary" size="lg">
                Start Free Trial →
              </Button>
              <Button onClick={onDemoClick} variant="outline" size="lg">
                ▶ Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="text-green-400 mr-1">✓</span>
                No credit card required
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-1">✓</span>
                Setup in minutes
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="mb-4">
                <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 text-2xl">▶</span>
                    </div>
                    <p className="text-sm text-gray-600">Demo Video Preview</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Campaign Generation
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>✓ Twitter Thread</div>
                  <div>✓ LinkedIn Post</div>
                  <div>✓ Email Campaign</div>
                  <div>✓ UGC Video</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
