import { XeloraLogo } from "./XeloraLogo";

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
            <p className="text-tron-text-muted">
              &copy; 2025 XELORA. All rights reserved.
            </p>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="https://x.com/3KPRO_SAAS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Follow us on X (formerly Twitter)"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com/company/3k-pro-services"
                target="_blank"
                rel="noopener noreferrer"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Connect with us on LinkedIn"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="mailto:info@3kpro.services"
                className="text-tron-text-muted hover:text-tron-cyan transition-colors"
                aria-label="Email us"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
