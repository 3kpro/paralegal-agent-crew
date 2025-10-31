import { Button } from "./ui/Button";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface NavigationProps {
  onContactClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onContactClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Tron-inspired animation settings
  const transitionTiming: [number, number, number, number] = [
    0.25, 0.46, 0.45, 0.94,
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const NavItem = ({ id, label }: { id: string; label: string }) => (
    <motion.button
      onClick={() => scrollToSection(id)}
      className={`relative text-tron-text hover:text-tron-cyan transition-colors duration-300`}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3, ease: transitionTiming },
      }}
    >
      {label}
      {activeSection === id && (
        <motion.div
          className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 0.3, ease: transitionTiming }}
          style={{ boxShadow: "0 0 5px #00ffff" }}
        />
      )}
    </motion.button>
  );

  return (
    <>
      {/* Beta Announcement Banner */}
      <div className="fixed top-0 w-full bg-gradient-to-r from-tron-magenta to-tron-cyan text-white z-[60] py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold"
          >
            🚀 <span className="animate-pulse">LIVE NOW</span>: TrendPulse™
            Beta • Join 2,500+ Creators • 50% Lifetime Discount •
            <Link
              href="/trend-gen"
              className="underline hover:no-underline ml-1"
            >
              Get Beta Access →
            </Link>
          </motion.p>
        </div>
      </div>

      <nav className="fixed top-10 w-full bg-tron-grid/90 backdrop-blur-md border-b border-tron-cyan/30 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3, ease: transitionTiming },
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3K</span>
              </div>
              <span className="text-xl font-bold text-tron-text">
                3K Pro Services
              </span>
            </motion.button>

            <div className="hidden md:flex items-center space-x-8">
              <NavItem id="services" label="Services" />
              <NavItem id="pricing" label="Pricing" />
              <NavItem id="contact" label="About" />
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/trend-gen">
                <Button variant="primary" className="relative overflow-hidden">
                  <span className="relative z-10">Join Beta</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-tron-cyan to-tron-magenta opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-tron-text hover:text-tron-cyan transition-colors p-2"
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.3, ease: transitionTiming },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  ></path>
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-100 py-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: transitionTiming }}
            >
              <div className="flex flex-col space-y-4">
                <motion.button
                  onClick={() => scrollToSection("services")}
                  className="text-tron-text hover:text-tron-cyan transition-colors text-left px-4"
                  whileHover={{ x: 5, color: "#00ffff" }}
                >
                  Services
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("pricing")}
                  className="text-tron-text hover:text-tron-cyan transition-colors text-left px-4"
                  whileHover={{ x: 5, color: "#00ffff" }}
                >
                  Pricing
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("contact")}
                  className="text-tron-text hover:text-tron-cyan transition-colors text-left px-4"
                  whileHover={{ x: 5, color: "#00ffff" }}
                >
                  About
                </motion.button>
                <div className="flex flex-col space-y-2 px-4">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/trend-gen">
                    <Button
                      onClick={() => setMobileMenuOpen(false)}
                      variant="primary"
                    >
                      Join Beta
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>
    </>
  );
};
