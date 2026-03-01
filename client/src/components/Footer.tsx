/*
 * Design: Fluid Commerce — Soft Corporate Dynamism
 * Footer: Clean, organized with multiple columns
 */

const platformLinks = [
  { label: "Sales & Invoicing", href: "#modules" },
  { label: "Inventory Management", href: "#modules" },
  { label: "Procurement", href: "#modules" },
  { label: "Financial Accounting", href: "#modules" },
  { label: "CRM", href: "#modules" },
  { label: "Reports & Analytics", href: "#modules" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
  { label: "Careers", href: "#" },
  { label: "Partner Program", href: "#" },
];

const resourceLinks = [
  { label: "Knowledge Center", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "System Status", href: "#" },
  { label: "Integrations", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Security", href: "#" },
  { label: "EULA", href: "#" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href === "#") return;
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white/70">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-white/90 p-1 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Fateh ERP Logo"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.nextElementSibling?.classList.remove('hidden');
                    target.parentElement?.classList.add('hidden');
                  }}
                />
              </div>
              <div className="hidden flex-col">
                <span className="font-display font-bold text-[1.1rem] leading-tight text-white">
                  Fateh<span className="text-coral"> ERP</span>
                </span>
                <span className="text-[0.6rem] font-body font-medium text-white/40 tracking-widest uppercase leading-none">
                  Trading Platform
                </span>
              </div>
            </div>
            <p className="text-white/50 font-body text-sm leading-relaxed max-w-xs mb-6">
              Saudi Arabia's leading ERP solution for trading businesses. ZATCA compliant, cloud-based, and built for growth.
            </p>
            <div className="flex gap-3">
              {["X", "in", "f"].map((icon) => (
                <button
                  key={icon}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white text-xs font-bold transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm text-white mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-white/50 hover:text-white font-body text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 font-body text-xs">
            &copy; {new Date().getFullYear()} Fateh ERP. All rights reserved.
          </p>
          <p className="text-white/30 font-body text-xs">
            Built for Saudi Trading Businesses
          </p>
        </div>
      </div>
    </footer>
  );
}
