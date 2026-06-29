import { STATUS_SEQUENCE } from '../lib/statusConfig';

/**
 * Renders the filter tabs and handles selection.
 * @param {HTMLElement} container 
 * @param {string} currentFilter - 'All' or a status string
 * @param {Function} onFilterChange - callback (newFilter) => void
 */
export function renderFilterBar(container, currentFilter, onFilterChange) {
  if (!container) return;

  const filters = ['All', ...STATUS_SEQUENCE];

  container.innerHTML = filters
    .map(f => {
      const isActive = currentFilter === f ? 'active' : '';
      return `<button class="filter-tab ${isActive}" data-filter="${f}">${f}</button>`;
    })
    .join('');

  // Add event listeners
  const buttons = container.querySelectorAll('.filter-tab');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.getAttribute('data-filter');
      onFilterChange(selectedFilter);
    });
  });
}
