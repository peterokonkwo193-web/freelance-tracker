import { formatCurrency } from '../lib/exportHelpers';

/**
 * Calculates statistics and updates the Summary Stats grid.
 * @param {HTMLElement} container 
 * @param {Array} jobs 
 */
export function renderSummaryStats(container, jobs) {
  if (!container) return;

  const total = jobs.length;
  const active = jobs.filter(j => j.status !== 'Completed').length;
  const completed = jobs.filter(j => j.status === 'Completed').length;
  const totalPay = jobs.reduce((sum, j) => sum + parseFloat(j.price || 0), 0);

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Total Jobs</span>
        <span class="stat-value">${total}</span>
      </div>
    </div>

    <div class="stat-card stat-active">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Active Jobs</span>
        <span class="stat-value">${active}</span>
      </div>
    </div>

    <div class="stat-card stat-completed">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Completed</span>
        <span class="stat-value">${completed}</span>
      </div>
    </div>

    <div class="stat-card stat-pay">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>
      <div class="stat-info">
        <span class="stat-label">Total Worker Pay</span>
        <span class="stat-value">${formatCurrency(totalPay)}</span>
      </div>
    </div>
  `;
}
