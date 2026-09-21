import { useState } from 'react';
import { initials, tintIndex } from '../../utils/people';

export default function Avatar({ user, size = 28, ring = false, title }) {
  const [broken, setBroken] = useState(false);
  const name = user?.name || 'Unassigned';
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) };
  const cls = `avatar avatar-tint-${user ? tintIndex(String(user._id || user.email || name)) : 'none'} ${ring ? 'avatar-ring' : ''}`;
  if (user?.avatar && !broken) {
    return <img className={cls} style={style} src={user.avatar} alt={name} title={title ?? name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
  }
  return (
    <span className={cls} style={style} role="img" aria-label={name} title={title ?? name}>
      {user ? initials(name) : ''}
    </span>
  );
}

export function AvatarStack({ users = [], max = 4, size = 26 }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <span className="avatar-stack" aria-label={`${users.length} ${users.length === 1 ? 'member' : 'members'}`}>
      {shown.map((u) => (
        <Avatar key={u._id} user={u} size={size} ring />
      ))}
      {extra > 0 && (
        <span className="avatar avatar-more avatar-ring num" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden="true">
          +{extra}
        </span>
      )}
    </span>
  );
}
