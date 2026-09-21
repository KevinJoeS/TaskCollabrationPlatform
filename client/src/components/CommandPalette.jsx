import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, ListChecks, FolderKanban, Users, Activity, Settings, Plus, SunMoon, CornerDownLeft, SearchX } from 'lucide-react';
import Modal from './ui/Modal';
import Avatar from './ui/Avatar';
import { StatusIcon } from './ui/Badge';
import { useDebounce } from '../hooks/useUtilities';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { useTheme } from '../context/ThemeContext';
import { searchService } from '../services/workspace';

export default function CommandPalette({ open, onClose, onNewProject }) {
  return (
    <Modal open={open} onClose={onClose} variant="palette" hideHeader labelledBy="palette-label">
      {open && <PaletteBody onClose={onClose} onNewProject={onNewProject} />}
    </Modal>
  );
}

function PaletteBody({ onClose, onNewProject }) {
  const navigate = useNavigate();
  const { openTask } = useTaskPanel();
  const { toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const term = useDebounce(query.trim(), 180);

  useEffect(() => {
    if (term.length < 2) {
      setResults(null);
      setState('idle');
      return;
    }
    const ctrl = new AbortController();
    setState('loading');
    searchService
      .query(term, ctrl.signal)
      .then((r) => {
        setResults(r);
        setState('done');
        setActive(0);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') setState('error');
      });
    return () => ctrl.abort();
  }, [term]);

  const go = (path) => () => {
    onClose();
    navigate(path);
  };

  const groups = useMemo(() => {
    if (results) {
      return [
        { label: 'Projects', items: results.projects.map((p) => ({ id: `p-${p._id}`, icon: <FolderKanban size={16} />, title: p.name, meta: `${p.memberCount} ${p.memberCount === 1 ? 'member' : 'members'}`, run: go(`/projects/${p._id}`) })) },
        { label: 'Tasks', items: results.tasks.map((t) => ({ id: `t-${t._id}`, icon: <StatusIcon status={t.status} size={16} />, title: t.title, meta: t.project?.name, run: () => { onClose(); setTimeout(() => openTask(t._id), 0); } })) },
        { label: 'Team members', items: results.members.map((m) => ({ id: `m-${m._id}`, icon: <Avatar user={m} size={20} />, title: m.name, meta: m.email, run: go(`/team?member=${m._id}`) })) },
      ].filter((g) => g.items.length);
    }
    const q = query.trim().toLowerCase();
    const actions = [
      { id: 'a-new', icon: <Plus size={16} />, title: 'Create project', run: () => { onClose(); onNewProject(); } },
      { id: 'a-theme', icon: <SunMoon size={16} />, title: 'Switch light / dark theme', run: () => { toggleTheme(); onClose(); } },
    ];
    const pages = [
      { id: 'n-dash', icon: <LayoutDashboard size={16} />, title: 'Dashboard', run: go('/dashboard') },
      { id: 'n-tasks', icon: <ListChecks size={16} />, title: 'My tasks', run: go('/tasks') },
      { id: 'n-proj', icon: <FolderKanban size={16} />, title: 'Projects', run: go('/projects') },
      { id: 'n-team', icon: <Users size={16} />, title: 'Team', run: go('/team') },
      { id: 'n-act', icon: <Activity size={16} />, title: 'Activity', run: go('/activity') },
      { id: 'n-set', icon: <Settings size={16} />, title: 'Settings', run: go('/settings') },
    ];
    const match = (i) => !q || i.title.toLowerCase().includes(q);
    return [
      { label: 'Go to', items: pages.filter(match) },
      { label: 'Actions', items: actions.filter(match) },
    ].filter((g) => g.items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, query]);

  const flat = groups.flatMap((g) => g.items);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!flat.length) return;
      const next = (active + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length;
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flat[active]?.run();
    }
  };

  let index = -1;
  const noResults = state === 'done' && flat.length === 0;

  return (
    <div className="palette">
      <div className="palette-input">
        <Search size={18} aria-hidden="true" />
        <input
          data-autofocus
          id="palette-label"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={flat[active] ? `opt-${flat[active].id}` : undefined}
          aria-label="Search projects, tasks and people"
          placeholder="Search projects, tasks and people"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
        {state === 'loading' && <span className="btn-spinner palette-spinner" aria-hidden="true" />}
        <kbd className="kbd">Esc</kbd>
      </div>

      <div className="palette-list" id="palette-list" role="listbox" ref={listRef} aria-label="Results">
        {state === 'error' && <p className="palette-note">Search is unavailable right now. Check your connection and try again.</p>}
        {noResults && (
          <div className="palette-empty">
            <SearchX size={20} strokeWidth={1.6} aria-hidden="true" />
            <p>
              Nothing matches <strong>"{term}"</strong>.
            </p>
            <span>Search looks through project names, task titles and descriptions, and teammates.</span>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.label} role="group" aria-label={g.label}>
            <p className="palette-group">{g.label}</p>
            {g.items.map((item) => {
              index += 1;
              const i = index;
              return (
                <div key={item.id} id={`opt-${item.id}`} role="option" aria-selected={i === active} data-index={i} className={`palette-item ${i === active ? 'is-active' : ''}`} onMouseMove={() => active !== i && setActive(i)} onClick={item.run}>
                  <span className="palette-item-icon">{item.icon}</span>
                  <span className="palette-item-title truncate">{item.title}</span>
                  {item.meta && <span className="palette-item-meta truncate">{item.meta}</span>}
                  <CornerDownLeft size={13} className="palette-item-enter" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <footer className="palette-foot" aria-hidden="true">
        <span><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> to move</span>
        <span><kbd className="kbd">Enter</kbd> to open</span>
      </footer>
    </div>
  );
}
