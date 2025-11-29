import { Button } from "./ui/Button";
import Link from "next/link";
import { useState } from "react";
import TrendPulseLogo from "./TrendPulseLogo";

interface NavigationProps {
  onContactClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const NavItem = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => scrollToSection(id)}
      className="text-gray-300 hover:text-white transition-colors font-medium"
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-[#2b2b2b]/95 backdrop-blur-md border-b-2 border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <TrendPulseLogo className="w-8 h-8" />
            <span className="text-xl font-semibold text-white">
              TrendPulse
            </span>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <NavItem id="services" label="Features" />
            <NavItem id="pricing" label="Pricing" />
            <NavItem id="contact" label="Contact" />
            <Link href="/login">
              <Button variant="primary">Sign In / Sign Up</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white transition-colors p-2"
              aria-label="Toggle menu"
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
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/30 py-4 bg-[#2b2b2b]/95">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("services")}
                className="text-gray-300 hover:text-white transition-colors text-left px-4"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-gray-300 hover:text-white transition-colors text-left px-4"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-300 hover:text-white transition-colors text-left px-4"
              >
                Contact
              </button>
              <div className="px-4">
                <Link href="/login">
                  <Button
                    variant="primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In / Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
