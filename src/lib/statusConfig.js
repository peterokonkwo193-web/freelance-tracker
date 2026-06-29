export const STATUS_SEQUENCE = ['New', 'Started', 'Confirmed', 'Milestone Cleared', 'Completed'];

export const STATUS_CONFIG = {
  'New': {
    label: 'New',
    color: '#9CA3AF',
    bgClass: 'bg-status-new',
    textClass: 'text-status-new',
    badgeClass: 'badge-new'
  },
  'Started': {
    label: 'Started',
    color: '#3B82F6',
    bgClass: 'bg-status-started',
    textClass: 'text-status-started',
    badgeClass: 'badge-started'
  },
  'Confirmed': {
    label: 'Confirmed',
    color: '#F97316',
    bgClass: 'bg-status-confirmed',
    textClass: 'text-status-confirmed',
    badgeClass: 'badge-confirmed'
  },
  'Milestone Cleared': {
    label: 'Milestone Cleared',
    color: '#8B5CF6',
    bgClass: 'bg-status-milestone',
    textClass: 'text-status-milestone',
    badgeClass: 'badge-milestone'
  },
  'Completed': {
    label: 'Completed',
    color: '#10B981',
    bgClass: 'bg-status-completed',
    textClass: 'text-status-completed',
    badgeClass: 'badge-completed'
  }
};

/**
 * Gets the next status in the sequence.
 * Returns null if the current status is the last one (Completed).
 * @param {string} currentStatus 
 * @returns {string|null}
 */
export function getNextStatus(currentStatus) {
  const index = STATUS_SEQUENCE.indexOf(currentStatus);
  if (index === -1 || index === STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return STATUS_SEQUENCE[index + 1];
}
