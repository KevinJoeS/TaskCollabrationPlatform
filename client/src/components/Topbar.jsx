import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { IconButton } from './ui/Button';
import { Logo } from './ui/Misc';
import { useTheme } from '../context/ThemeContext';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export default function Topbar({ onOpenMenu, onOpenSearch, onOpenNotifications, unread }) {
  const { resolved, toggle } = useTheme();
  return (
    <header className="topbar">
      <IconButton className="topbar-menu" icon={Menu} label="Open menu" onClick={onOpenMenu} />
      <span className="topbar-logo">
        <Logo to="/dashboard" compact />
      </span>
      <button type="button" className="search-trigger" onClick={onOpenSearch} aria-label="Search (Ctrl K)">
        <Search size={15} aria-hidden="true" />
        <span>Search</span>
        <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      <div className="topbar-actions">
        <IconButton icon={resolved === 'dark' ? Sun : Moon} label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle} />
        <span className="topbar-bell">
          <IconButton icon={Bell} label={unread ? `Notifications, ${unread} unread` : 'Notifications'} onClick={onOpenNotifications} />
          {unread > 0 && <span className="topbar-bell-dot" aria-hidden="true" />}
        </span>
      </div>
    </header>
  );
}
