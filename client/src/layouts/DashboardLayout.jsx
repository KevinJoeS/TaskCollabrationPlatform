import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskPanel from '../components/TaskPanel';
import CommandPalette from '../components/CommandPalette';
import NotificationCenter from '../components/NotificationCenter';
import ProjectForm from '../components/ProjectForm';
import Skeleton from '../components/ui/Skeleton';
import { useHotkey } from '../hooks/useUtilities';
import { useNotifications } from '../hooks/useWorkspace';

const COLLAPSE_KEY = 'taskcollab_sidebar_collapsed';

export default function DashboardLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const { unread } = useNotifications();

  useHotkey('k', () => setSearchOpen((o) => !o));
  useEffect(() => localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'), [collapsed]);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const openNewProject = useCallback(() => setProjectFormOpen(true), []);

  return (
    <div className={`shell ${collapsed ? 'is-collapsed' : ''}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} unread={unread} onOpenNotifications={() => setNotifOpen(true)} />
      <div className="shell-main">
        <Topbar onOpenMenu={() => setMobileOpen(true)} onOpenSearch={() => setSearchOpen(true)} onOpenNotifications={() => setNotifOpen(true)} unread={unread} />
        <main id="main" className="content" tabIndex={-1}>
          <Suspense fallback={<PageFallback />}>
            <div className="page-enter" key={location.pathname}>
              <Outlet context={{ openNewProject }} />
            </div>
          </Suspense>
        </main>
      </div>
      <TaskPanel />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} onNewProject={openNewProject} />
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProjectForm open={projectFormOpen} onClose={() => setProjectFormOpen(false)} />
    </div>
  );
}

function PageFallback() {
  return (
    <div role="status" aria-label="Loading page">
      <Skeleton width={220} height={26} />
      <Skeleton width={340} height={12} style={{ marginTop: 12 }} />
    </div>
  );
}
