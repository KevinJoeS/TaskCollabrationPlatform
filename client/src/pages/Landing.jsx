import { useEffect, useRef } from 'react';
import { LayoutDashboard, ListChecks, FolderKanban, Users, Activity, Search, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar, { AvatarStack } from '../components/ui/Avatar';
import { StatusIcon, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Logo, Progress } from '../components/ui/Misc';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle, useReveal } from '../hooks/useUtilities';

// Sample content for the product preview. It is labelled as a sample in the UI; no real people or numbers are implied.
const P = {
  alex: { _id: 'sample-alex', name: 'Alex Kim' },
  priya: { _id: 'sample-priya', name: 'Priya Nair' },
  marco: { _id: 'sample-marco-r', name: 'Marco Ruiz' },
  dana: { _id: 'sample-dana-lee', name: 'Dana Lee' },
};
const COLUMNS = [
  { status: 'todo', label: 'To do', cards: [{ t: 'Write launch announcement', p: 'medium', due: 'Due in 4 days', who: P.dana }, { t: 'QA checkout on mobile', p: 'high', due: 'Due tomorrow', soon: true, who: P.marco }] },
  { status: 'in-progress', label: 'In progress', cards: [{ t: 'Homepage hero and navigation', p: 'high', due: 'Due today', soon: true, who: P.alex, c: 3 }, { t: 'Migrate blog content', p: 'low', due: 'Jun 24', who: P.priya }] },
  { status: 'in-review', label: 'In review', cards: [{ t: 'Pricing page copy', p: 'medium', due: 'Jun 20', who: P.priya, c: 5 }] },
];

export default function Landing() {
  useDocumentTitle('');
  const { user } = useAuth();

  const explore = () => {
    document.getElementById('product')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-brand" aria-hidden="true">TaskCollab</p>
          <h1 className="hero-title">Turn scattered work into coordinated progress.</h1>
          <p className="hero-sub">Plan projects, organize tasks, collaborate with your team, and keep every deadline within reach.</p>
          <div className="hero-cta">
            <Button variant="primary" size="lg" to={user ? '/dashboard' : '/register'}>
              {user ? 'Open workspace' : 'Get Started'}
            </Button>
            <Button variant="secondary" size="lg" onClick={explore}>
              Explore Workspace
            </Button>
          </div>
        </div>
      </section>

      <section id="product" className="product" aria-labelledby="product-title">
        <h2 id="product-title" className="sr-only">Product preview</h2>
        <ProductPreview />
        <p className="product-caption">A sample workspace. Yours starts empty and fills with your own projects.</p>
      </section>

      <section id="features" className="section" aria-labelledby="features-title">
        <div className="section-head">
          <h2 id="features-title" className="section-title">Everything a task needs, attached to the task.</h2>
          <p className="section-lead">No separate tools for planning, chasing and discussing. The work, the people and the conversation stay together.</p>
        </div>
        <div className="feature-grid">
          <Feature title="A board with five honest stages" body="Backlog, To do, In progress, In review, Completed. Drag a card to move it, or use the card menu on a phone.">
            <div className="frag frag-stages">
              {['backlog', 'todo', 'in-progress', 'in-review', 'done'].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </Feature>
          <Feature title="Owners, priorities and dates on every card" body="Each task shows who has it, how much it matters and when it's due, without opening it.">
            <div className="frag">
              <PreviewCard card={COLUMNS[1].cards[0]} />
            </div>
          </Feature>
          <Feature title="Conversation where the work is" body="Comment on a task and the assignee is notified. Decisions stay next to the thing they're about.">
            <div className="frag frag-comment">
              <Avatar user={P.priya} size={28} />
              <div>
                <p><strong>Priya Nair</strong><span>2h ago</span></p>
                <p>Copy is final. Can we ship the pricing page Thursday?</p>
              </div>
            </div>
          </Feature>
          <Feature title="Find anything from the keyboard" body="Press Ctrl K to jump to a project, open a task or look up a teammate.">
            <div className="frag frag-search">
              <Search size={16} aria-hidden="true" />
              <span>pricing</span>
              <kbd className="kbd">Ctrl K</kbd>
            </div>
          </Feature>
        </div>
      </section>

      <section id="workflow" className="section section-alt" aria-labelledby="workflow-title">
        <div className="section-head">
          <h2 id="workflow-title" className="section-title">From first idea to done, in four steps.</h2>
        </div>
        <ol className="workflow">
          {[
            ['Create a project', 'Name it, describe the goal, and add teammates by email.'],
            ['Break it into tasks', 'Give each task an owner, a priority and a due date.'],
            ['Move work across the board', 'Status changes are logged, so everyone sees what moved and when.'],
            ['Review and complete', 'Discuss in comments, send work to review, and close it out.'],
          ].map(([title, body], i) => (
            <li key={title} className="workflow-step">
              <span className="workflow-num num" aria-hidden="true">{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="about" className="section about" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">About TaskCollab</h2>
        <div className="about-body">
          <p>TaskCollab is a focused workspace for teams that want to see their work clearly: what's planned, who has it, and what's due next.</p>
          <p>Projects are private to their members. Passwords are stored hashed, sessions use signed tokens, and every project, task and comment request is checked against project membership on the server.</p>
          <p>It's built with React on the front end and Node, Express and MongoDB behind it.</p>
        </div>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <h2 id="cta-title">Bring your next project into focus.</h2>
        <Button variant="accent" size="lg" to={user ? '/dashboard' : '/register'}>
          {user ? 'Open workspace' : 'Get Started'}
        </Button>
      </section>
    </div>
  );
}

function Feature({ title, body, children }) {
  return (
    <article className="feature">
      <div className="feature-visual" aria-hidden="true">{children}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function PreviewCard({ card }) {
  return (
    <div className="task-card pv-card">
      <div className="task-card-top"><PriorityBadge priority={card.p} /></div>
      <p className="task-card-title">{card.t}</p>
      <div className="task-card-foot">
        <span className={`due ${card.soon ? 'due-soon' : ''}`}>{card.due}</span>
        <span className="task-card-meta">
          {card.c && <span className="task-card-comments num"><MessageSquare size={13} />{card.c}</span>}
          <Avatar user={card.who} size={20} />
        </span>
      </div>
    </div>
  );
}

/** A static composition of the real interface. It flattens from a slight tilt as it scrolls into view. */
function ProductPreview() {
  const frame = useRef(null);
  const reveal = useReveal({ threshold: 0.05 });

  useEffect(() => {
    const el = frame.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      // 1 when the frame's top is at the bottom of the viewport, 0 once it reaches 25% from the top.
      const t = Math.min(1, Math.max(0, (r.top - window.innerHeight * 0.25) / (window.innerHeight * 0.75)));
      el.style.setProperty('--tilt', t.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pv-stage reveal" ref={reveal}>
      <div className="pv" ref={frame} role="img" aria-label="Preview of the TaskCollab workspace: a project overview with task progress, a board of tasks by status, upcoming deadlines, team members and recent activity.">
        <div className="pv-side" aria-hidden="true">
          <Logo onDark to="#" />
          <ul>
            {[[LayoutDashboard, 'Dashboard'], [ListChecks, 'My tasks'], [FolderKanban, 'Projects', true], [Users, 'Team'], [Activity, 'Activity']].map(([Icon, label, on]) => (
              <li key={label} className={on ? 'is-on' : ''}><Icon size={15} />{label}</li>
            ))}
          </ul>
        </div>
        <div className="pv-main" aria-hidden="true">
          <div className="pv-top">
            <div>
              <p className="pv-title">Website relaunch</p>
              <p className="pv-sub">New marketing site, pricing and blog migration</p>
            </div>
            <span className="pv-sample">Sample workspace</span>
          </div>
          <div className="pv-meta">
            <AvatarStack users={Object.values(P)} size={24} />
            <span className="pv-meta-text">4 members</span>
            <span className="pv-progress"><span className="num">14 of 22 done</span><Progress value={64} /><strong className="num">64%</strong></span>
          </div>
          <div className="pv-body">
            <div className="pv-board">
              {COLUMNS.map((col) => (
                <div className="pv-col" key={col.status}>
                  <p className="pv-col-head"><StatusIcon status={col.status} />{col.label}<span className="num">{col.cards.length}</span></p>
                  {col.cards.map((c) => <PreviewCard key={c.t} card={c} />)}
                </div>
              ))}
            </div>
            <div className="pv-rail">
              <p className="pv-rail-title">Upcoming deadlines</p>
              <ul className="pv-deadlines">
                <li><span className="pv-date pv-date-soon num"><strong>17</strong>Jun</span><span>Homepage hero and navigation</span></li>
                <li><span className="pv-date pv-date-soon num"><strong>18</strong>Jun</span><span>QA checkout on mobile</span></li>
                <li><span className="pv-date num"><strong>20</strong>Jun</span><span>Pricing page copy</span></li>
              </ul>
              <p className="pv-rail-title">Recent activity</p>
              <ul className="pv-activity">
                <li><Avatar user={P.marco} size={20} /><span><strong>Marco</strong> completed Set up analytics</span></li>
                <li><Avatar user={P.priya} size={20} /><span><strong>Priya</strong> moved Pricing page copy to In review</span></li>
                <li><Avatar user={P.alex} size={20} /><span><strong>Alex</strong> commented on Homepage hero</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
