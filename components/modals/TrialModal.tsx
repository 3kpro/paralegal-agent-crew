import { Button } from "../ui/Button";

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactClick: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({
  isOpen,
  onClose,
  onContactClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Start Your Free Trial
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Get Started Today!
          </h3>
          <p className="text-gray-500 mb-4">
            Join our early access program and be among the first to experience
            Xelora
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-2">✓</span>
            14-day free trial
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-2">✓</span>
            No credit card required
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-green-500 mr-2">✓</span>
            Full access to all features
          </div>
        </div>

        <div className="space-y-4">
          <Button onClick={onContactClick} variant="primary" className="w-full">
            Join Early Access
          </Button>
          <Button onClick={onClose} variant="secondary" className="w-full">
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};
