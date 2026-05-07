export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date() > new Date(dueDate);
};

export const getPriorityColor = (priority) => {
  const map = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--orange)', critical: 'var(--red)' };
  return map[priority] || 'var(--text-muted)';
};

export const getStatusColor = (status) => {
  const map = { todo: 'var(--text-muted)', 'in-progress': 'var(--blue)', 'in-review': 'var(--purple)', completed: 'var(--green)' };
  return map[status] || 'var(--text-muted)';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};