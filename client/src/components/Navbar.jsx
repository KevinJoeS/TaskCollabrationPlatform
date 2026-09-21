import { useEffect, useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Logo } from './ui/Misc';
import Button, { IconButton } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'about', label: 'About' },
];

/** Public navigation with scroll-spy: the link for the section in view is marked active. */
export default function Navbar() {
  const { user } = useAuth();
  const { resolved, toggle } = useTheme();
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.6] }
    );
    sections.forEach((s) => io.observe(s));
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY < 200) setActive('');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Logo />
        <nav className={`navbar-links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="navbar-link" aria-current={active === l.id ? 'true' : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="navbar-links-auth">
            {user ? (
              <Button variant="primary" to="/dashboard" full>Open workspace</Button>
            ) : (
              <>
                <Button variant="secondary" to="/login" full>Login</Button>
                <Button variant="primary" to="/register" full>Get Started</Button>
              </>
            )}
          </div>
        </nav>
        <div className="navbar-actions">
          <IconButton icon={resolved === 'dark' ? Sun : Moon} label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle} />
          {user ? (
            <Button variant="primary" size="sm" to="/dashboard" className="navbar-cta">Open workspace</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login" className="navbar-cta">Login</Button>
              <Button variant="primary" size="sm" to="/register" className="navbar-cta">Get Started</Button>
            </>
          )}
          <IconButton className="navbar-burger" icon={open ? X : Menu} label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </div>
    </header>
  );
}
