import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Menu, X, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  {
    label: 'Ebooks',
    children: [
      { label: 'Grade E — Ebook', to: '/ebook/E' },
      { label: 'Grade D — Ebook', to: '/ebook/D' },
      { label: 'Grade C — Ebook', to: '/ebook/C' },
    ],
  },
  { label: 'Academy', to: '/academy' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ebookOpen, setEbookOpen] = useState(false);
  const location = useLocation();

  // Close menus when the route changes (adjust state during render — no effect needed)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setMenuOpen(false);
    setEbookOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to) => location.pathname === to;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg py-0'
          : 'bg-transparent py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 lift-on-hover">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-primary-glow">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <span className="font-display font-bold text-base text-ink dark:text-dark-ink tracking-tight leading-none">
              McMaster Skool
            </span>
            <p className="text-[10px] font-mono text-muted dark:text-dark-muted uppercase tracking-widest leading-none mt-0.5">
              PSIRA Accredited
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.label} className="relative">
                <button
                  onClick={() => setEbookOpen(o => !o)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${ebookOpen
                      ? 'bg-primary text-white'
                      : 'text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary'
                    }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {link.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ebookOpen ? 'rotate-180' : ''}`} />
                </button>
                {ebookOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl shadow-xl py-2 border border-divider dark:border-dark-border overflow-hidden">
                    {link.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="block px-4 py-2.5 text-sm font-medium text-ink dark:text-dark-ink hover:bg-primary hover:text-white transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all lift-on-hover ${
                  isActive(link.to)
                    ? 'bg-primary text-white shadow-primary-glow'
                    : 'text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          )}

          <Link
            to="/academy"
            className="magnetic-btn ml-3 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold shadow-primary-glow"
          >
            Start Training →
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-2 rounded-xl text-ink dark:text-dark-ink hover:bg-primary/10 transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-divider dark:border-dark-border px-6 py-6 flex flex-col gap-2">
          <Link to="/" className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary transition">Home</Link>
          <div className="pl-2 border-l-2 border-primary/30 ml-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted dark:text-dark-muted mb-2 pl-2">Ebooks</p>
            <Link to="/ebook/E" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary transition">Grade E — Ebook</Link>
            <Link to="/ebook/D" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary transition">Grade D — Ebook</Link>
            <Link to="/ebook/C" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary transition">Grade C — Ebook</Link>
          </div>
          <Link to="/academy" className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink dark:text-dark-ink hover:bg-primary/10 hover:text-primary transition">Academy</Link>
          <Link to="/academy" className="mt-2 text-center px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-primary-glow">Start Training →</Link>
        </div>
      )}
    </header>
  );
}
