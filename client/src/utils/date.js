const DAY = 86400000;

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Whole days from today to the date. Negative means the date has passed. */
export const daysUntil = (date) => Math.round((startOfDay(date) - startOfDay(new Date())) / DAY);

const fmtShort = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fmtLong = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.getFullYear() === new Date().getFullYear() ? fmtShort.format(date) : fmtLong.format(date);
};
export const formatDateLong = (d) => (d ? fmtLong.format(new Date(d)) : '');
export const formatDateTime = (d) => (d ? `${formatDate(d)}, ${fmtTime.format(new Date(d))}` : '');
export const formatTime = (d) => fmtTime.format(new Date(d));

/** "Overdue by 2 days", "Due today", "Due tomorrow", "Mar 4" plus an urgency level for styling. */
export function describeDue(dueDate, done = false) {
  if (!dueDate) return { label: 'No due date', urgency: 'none' };
  const n = daysUntil(dueDate);
  if (done) return { label: formatDate(dueDate), urgency: 'none' };
  if (n < 0) return { label: `Overdue by ${-n} ${n === -1 ? 'day' : 'days'}`, urgency: 'overdue' };
  if (n === 0) return { label: 'Due today', urgency: 'soon' };
  if (n === 1) return { label: 'Due tomorrow', urgency: 'soon' };
  if (n <= 6) return { label: `Due in ${n} days`, urgency: 'near' };
  return { label: formatDate(dueDate), urgency: 'none' };
}

export function timeAgo(d) {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d ago`;
  return formatDate(d);
}

export function dayHeading(d) {
  const n = daysUntil(d);
  if (n === 0) return 'Today';
  if (n === -1) return 'Yesterday';
  return fmtWeekday.format(new Date(d));
}

export const toInputDate = (d) => {
  if (!d) return '';
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

/** Date inputs give "YYYY-MM-DD". Store noon local time so the day never shifts across time zones. */
export const fromInputDate = (v) => (v ? new Date(`${v}T12:00:00`).toISOString() : null);

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
