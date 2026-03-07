import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/membership", label: "Membership" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Header / Nav ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" data-ocid="nav.home.link">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm leading-none">
                  MRC
                </span>
              </div>
              <span className="font-display font-semibold text-foreground text-sm tracking-wide hidden sm:block">
                Manhattan Racquet Club
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={`nav.${link.label.toLowerCase()}.link`}
                  className={`font-sans text-sm font-medium tracking-wide transition-colors duration-200 relative ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-accent"
                    />
                  )}
                </Link>
              );
            })}
            <Link
              to="/admin"
              data-ocid="nav.admin.link"
              className="font-sans text-xs font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase border border-border rounded-sm px-3 py-1.5 hover:border-foreground/30"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="md:hidden text-foreground p-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            data-ocid="nav.mobile.toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
                    onClick={() => setMobileOpen(false)}
                    className="font-sans text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  data-ocid="nav.mobile.admin.link"
                  onClick={() => setMobileOpen(false)}
                  className="font-sans text-xs font-medium text-muted-foreground hover:text-foreground uppercase tracking-widest"
                >
                  Admin ↗
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="font-display font-bold text-lg mb-2">
                Manhattan Racquet Club
              </div>
              <p className="text-primary-foreground/70 text-sm font-sans leading-relaxed">
                Excellence on the court.
                <br />
                Tradition in the city.
              </p>
            </div>

            {/* Nav */}
            <div>
              <div className="font-sans text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-3">
                Navigate
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={`footer.${link.label.toLowerCase()}.link`}
                    className="font-sans text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Address */}
            <div>
              <div className="font-sans text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-3">
                Find Us
              </div>
              <address className="font-sans text-sm text-primary-foreground/80 not-italic leading-relaxed">
                247 Park Avenue South
                <br />
                New York, NY 10003
                <br />
                <a
                  href="tel:+12125550192"
                  className="hover:text-primary-foreground transition-colors"
                >
                  +1 (212) 555-0192
                </a>
              </address>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-sans text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} Manhattan Racquet Club. All rights
              reserved.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
