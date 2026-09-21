import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, FolderKanban, Users, Activity, Bell, Settings, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Logo } from './ui/Misc';
import Avatar from './ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My tasks', icon: ListChecks },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/activity', label: 'Activity', icon: Activity },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, unread, onOpenNotifications }) {
  const { user, logout } = useAuth();
  const { projects } = useProjects();
  const navigate = useNavigate();

  const item = ({ to, label, icon: Icon }) => (
    <li key={to}>
      <NavLink to={to} className="side-link" title={collapsed ? label : undefined} onClick={onCloseMobile}>
        <Icon size={17} aria-hidden="true" />
        <span className="side-label">{label}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      <div className={`side-scrim ${mobileOpen ? 'is-open' : ''}`} onClick={onCloseMobile} aria-hidden="true" />
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`} aria-label="Workspace">
        <div className="side-top">
          <Logo to="/dashboard" onDark compact={collapsed && !mobileOpen} />
          <button type="button" className="side-icon-btn side-collapse" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="side-icon-btn side-close" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="side-nav" aria-label="Main">
          <p className="side-heading">Workspace</p>
          <ul>{NAV.map(item)}</ul>

          {projects?.length > 0 && (
            <>
              <p className="side-heading">Recent projects</p>
              <ul>
                {projects.slice(0, 5).map((p) => (
                  <li key={p._id}>
                    <NavLink to={`/projects/${p._id}`} className="side-link side-link-project" title={collapsed ? p.name : undefined} onClick={onCloseMobile}>
                      <span className="side-project-glyph" aria-hidden="true">
                        {p.name[0]?.toUpperCase()}
                      </span>
                      <span className="side-label truncate">{p.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="side-bottom">
          <ul>
            <li>
              <button type="button" className="side-link" title={collapsed ? 'Notifications' : undefined} onClick={() => { onCloseMobile(); onOpenNotifications(); }}>
                <span className="side-bell">
                  <Bell size={17} aria-hidden="true" />
                  {unread > 0 && collapsed && <span className="side-bell-dot" />}
                </span>
                <span className="side-label">Notifications</span>
                {unread > 0 && <span className="count-badge side-count" aria-label={`${unread} unread`}>{unread > 9 ? '9+' : unread}</span>}
              </button>
            </li>
            {item({ to: '/settings', label: 'Settings', icon: Settings })}
          </ul>
          <div className="side-user">
            <Avatar user={user} size={30} />
            <span className="side-user-id side-label">
              <strong className="truncate">{user?.name}</strong>
              <span className="truncate">{user?.email}</span>
            </span>
            <button
              type="button"
              className="side-icon-btn side-logout"
              aria-label="Log out"
              title="Log out"
              onClick={() => {
                logout();
                navigate('/', { replace: true });
              }}
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
