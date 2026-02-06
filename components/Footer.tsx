"use client";

import Link from "next/link";

export const Footer: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white border-t border-black py-24 text-black font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-black flex items-center justify-center font-bold text-xs">3K</div>
              <span className="text-xl font-bold uppercase tracking-tighter">XELORA</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 leading-relaxed">
              The predictive intelligence layer for creators. Stop guessing. Start engineering momentum.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 opacity-40">System Access</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              <li><button onClick={() => scrollToSection("services")} className="hover:opacity-60 transition-opacity">Decomposition Matrix</button></li>
              <li><button onClick={() => scrollToSection("pricing")} className="hover:opacity-60 transition-opacity">Allocation Indices</button></li>
              <li><button onClick={() => scrollToSection("about")} className="hover:opacity-60 transition-opacity">Technical Docs</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 opacity-40">Organization</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               <li><button onClick={() => scrollToSection("about")} className="hover:opacity-60 transition-opacity">Engineering Blog</button></li>
               <li><button onClick={() => scrollToSection("about")} className="hover:opacity-60 transition-opacity">Secure Channels</button></li>
               <li><button onClick={() => scrollToSection("about")} className="hover:opacity-60 transition-opacity">Operational Status</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 opacity-40">Engagement</h3>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               <li><button onClick={() => scrollToSection("contact")} className="hover:opacity-60 transition-opacity">Initiate Protocol</button></li>
               <li><a href="/privacy" className="hover:opacity-60 transition-opacity">Privacy Shield</a></li>
               <li><a href="/terms" className="hover:opacity-60 transition-opacity">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
              © {new Date().getFullYear()} XELORA.SYSTEMS_BY_{" "}
              <a href="https://3kpro.services" target="_blank" rel="noopener noreferrer" className="text-black hover:underline underline-offset-4">
                3KPRO.ENGINEERING
              </a>
            </p>
          </div>

          <div className="flex items-center gap-10">
             <a href="https://x.com/3KPRO_SAAS" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
               Terminal_X
             </a>
             <a href="https://linkedin.com/company/3k-pro-services" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
               Direct_In
             </a>
             <a href="mailto:james@3kpro.services" className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
               Secure_Mail
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
