import { Mail } from 'lucide-react';
import Avatar from './ui/Avatar';
import Popover from './ui/Popover';

/** Small profile summary shown when a member's avatar or name is clicked. */
export function MemberSummary({ member, role, openTasks, doneTasks, lastActive }) {
  return (
    <div className="member-summary">
      <div className="member-summary-head">
        <Avatar user={member} size={40} />
        <div className="member-summary-id">
          <strong className="truncate">{member.name}</strong>
          <span>{role}</span>
        </div>
      </div>
      <a className="member-summary-mail truncate" href={`mailto:${member.email}`}>
        <Mail size={13} aria-hidden="true" />
        {member.email}
      </a>
      <dl className="member-summary-stats">
        <div>
          <dt>Open tasks</dt>
          <dd className="num">{openTasks}</dd>
        </div>
        <div>
          <dt>Completed</dt>
          <dd className="num">{doneTasks}</dd>
        </div>
        {lastActive && (
          <div>
            <dt>Last active</dt>
            <dd>{lastActive}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export default function MemberPopover({ member, children, align = 'start', ...summary }) {
  return (
    <Popover
      role="dialog"
      align={align}
      className="member-popover"
      trigger={({ toggle, props }) => (
        <button type="button" className="member-trigger" onClick={toggle} aria-label={`${member.name}, profile summary`} {...props}>
          {children}
        </button>
      )}
    >
      {() => <MemberSummary member={member} {...summary} />}
    </Popover>
  );
}
