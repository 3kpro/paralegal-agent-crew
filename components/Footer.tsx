import { XeloraLogo } from "./XeloraLogo";
import { TwitterLogo, LinkedinLogo, Envelope } from "@phosphor-icons/react";

export const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-tron-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">XELORA</span>
              <XeloraLogo className="w-10 h-10" />
            </div>
            <p className="text-tron-text-muted">
              AI-powered content marketing platform for modern businesses.
            </p>
            <div className="mt-6">
              <a
                href="https://www.producthunt.com/posts/xelora?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-xelora"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1049670&theme=dark&t=1765658239336"
                  alt="XELORA - XELORA: Predict Momentum. Engineer Virality. | Product Hunt"
                  style={{ width: '250px', height: '54px' }}
                  width="250"
                  height="54"
                />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-tron-text-muted">
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  API
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-tron-text-muted">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Careers
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-tron-text-muted">
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-tron-cyan transition-colors"
                >
                  Status
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-tron-grid mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-tron-text-muted">
                &copy; 2025 XELORA by{" "}
                <a
                  href="https://3kpro.services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tron-cyan hover:text-tron-cyan/80 transition-colors"
                >
                  3KPRO.SERVICES
                </a>
                . All rights reserved.
              </p>
              <div className="flex gap-4 text-sm">
                <a
                  href="/privacy"
                  className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                >
                  Privacy Policy
                </a>
                <span className="text-tron-text-muted">•</span>
                <a
                  href="/terms"
                  className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="https://x.com/3KPRO_SAAS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Follow us on X (formerly Twitter)"
              >
                <TwitterLogo className="w-6 h-6" weight="duotone" />
              </a>

              <a
                href="https://linkedin.com/company/3k-pro-services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Connect with us on LinkedIn"
              >
                <LinkedinLogo className="w-6 h-6" weight="duotone" />
              </a>

              <a
                href="mailto:info@3kpro.services"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Email us"
              >
                <Envelope className="w-6 h-6" weight="duotone" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
