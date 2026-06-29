import { STATUS_CONFIG, getNextStatus } from '../lib/statusConfig';
import { formatCurrency } from '../lib/exportHelpers';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Emojis for quick buttons
const ICON_ADVANCE = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
`;
const ICON_EDIT = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
`;
const ICON_COMPLETE = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`;
const ICON_DELETE = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
`;

/**
 * Renders the table view on desktop and cards view on mobile.
 * @param {HTMLElement} tableContainer 
 * @param {HTMLElement} mobileContainer 
 * @param {Array} jobs 
 * @param {Object} handlers - { onAdvance, onEdit, onComplete, onDelete }
 */
export function renderJobTable(tableContainer, mobileContainer, jobs, handlers) {
  if (!tableContainer || !mobileContainer) return;

  // Empty state handling
  if (jobs.length === 0) {
    const emptyHtml = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div class="empty-state-title">No Jobs Found</div>
        <div class="empty-state-desc">Try changing the status filter or click "Add Job" to log subcontracted work.</div>
      </div>
    `;
    tableContainer.innerHTML = emptyHtml;
    mobileContainer.innerHTML = emptyHtml;
    return;
  }

  // Track expanded mobile cards
  // We can read expanding indices from standard data attributes
  
  // Render Desktop Table
  let tableHtml = `
    <table>
      <thead>
        <tr>
          <th style="width: 20%">Client</th>
          <th style="width: 20%">Worker</th>
          <th style="width: 15%">Price</th>
          <th style="width: 15%">Status</th>
          <th style="width: 20%">Notes</th>
          <th style="width: 10%">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  jobs.forEach(job => {
    const nextStatus = getNextStatus(job.status);
    const badge = STATUS_CONFIG[job.status] || STATUS_CONFIG['New'];
    const formattedPrice = formatCurrency(job.price);
    const rawNotes = job.notes || '';
    const shortNotes = rawNotes.length > 55 ? escapeHtml(rawNotes.substring(0, 52)) + '...' : (rawNotes ? escapeHtml(rawNotes) : '—');
    const notesTooltip = rawNotes ? `<div class="tooltip-notes">${escapeHtml(rawNotes).replace(/\n/g, '<br>')}</div>` : '';

    tableHtml += `
      <tr data-id="${job.id}">
        <td class="col-client">${escapeHtml(job.client_name)}</td>
        <td class="col-worker">${escapeHtml(job.worker_name)}</td>
        <td class="col-price">${formattedPrice}</td>
        <td>
          <span class="badge ${badge.badgeClass}">${escapeHtml(job.status)}</span>
        </td>
        <td class="notes-cell">
          <span class="notes-text">${shortNotes}</span>
          ${notesTooltip}
        </td>
        <td>
          <div class="actions-cell">
            <button class="btn-action btn-advance" title="${nextStatus ? `Advance Status to ${escapeHtml(nextStatus)}` : 'Already Completed'}" ${!nextStatus ? 'disabled' : ''}>
              ${ICON_ADVANCE}
            </button>
            <button class="btn-action btn-edit" title="Edit Job">
              ${ICON_EDIT}
            </button>
            <button class="btn-action btn-complete-quick" title="Mark Completed" ${job.status === 'Completed' ? 'disabled' : ''}>
              ${ICON_COMPLETE}
            </button>
            <button class="btn-action btn-delete" title="Delete Job">
              ${ICON_DELETE}
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tableHtml += `
      </tbody>
    </table>
  `;
  tableContainer.innerHTML = tableHtml;

  // Render Mobile Cards
  let mobileHtml = '';
  jobs.forEach((job, idx) => {
    const nextStatus = getNextStatus(job.status);
    const badge = STATUS_CONFIG[job.status] || STATUS_CONFIG['New'];
    const formattedPrice = formatCurrency(job.price);
    const cleanNotes = job.notes ? escapeHtml(job.notes).replace(/\n/g, '<br>') : '';

    mobileHtml += `
      <div class="job-card" data-id="${job.id}" data-index="${idx}">
        <div class="job-card-header">
          <div class="job-card-title">
            <span class="job-card-client">${escapeHtml(job.client_name)}</span>
            <span class="job-card-worker">Worker: ${escapeHtml(job.worker_name)}</span>
          </div>
          <span class="badge ${badge.badgeClass}">${escapeHtml(job.status)}</span>
        </div>
        
        <div class="job-card-details">
          <span class="job-card-price">${formattedPrice}</span>
          <button class="btn-action btn-toggle-expand" style="width: 44px; height: 44px;" title="View Details">
            •••
          </button>
        </div>

        <div class="job-card-expandable" style="display: none;">
          ${job.notes ? `
            <div class="job-card-notes-header">Notes</div>
            <p>${cleanNotes}</p>
          ` : '<p style="font-style: italic; color: var(--text-muted);">No notes available</p>'}
        </div>

        <div class="job-card-actions" style="display: none;">
          <button class="btn btn-secondary btn-edit btn-mobile-edit" style="height: 44px; padding: 0 1rem;">
            ${ICON_EDIT} Edit
          </button>
          <button class="btn btn-secondary btn-complete-quick btn-mobile-complete" style="height: 44px; padding: 0 1rem;" ${job.status === 'Completed' ? 'disabled' : ''}>
            ${ICON_COMPLETE} Complete
          </button>
          <button class="btn btn-secondary btn-advance btn-mobile-advance" style="height: 44px; padding: 0 1rem;" ${!nextStatus ? 'disabled' : ''}>
            ${ICON_ADVANCE} Next
          </button>
          <button class="btn btn-danger btn-delete btn-mobile-delete" style="width: 44px; height: 44px; padding: 0;">
            ${ICON_DELETE}
          </button>
        </div>
      </div>
    `;
  });
  mobileContainer.innerHTML = mobileHtml;

  // Set up desktop click event delegation
  setupDesktopListeners(tableContainer, jobs, handlers);

  // Set up mobile click event listeners and toggles
  setupMobileListeners(mobileContainer, jobs, handlers);
}

function setupDesktopListeners(container, jobs, handlers) {
  // Delegate clicks on rows
  container.querySelector('table').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const tr = btn.closest('tr');
    if (!tr) return;

    const jobId = tr.getAttribute('data-id');
    const job = jobs.find(j => j.id === jobId);

    if (btn.classList.contains('btn-advance')) {
      handlers.onAdvance(jobId);
    } else if (btn.classList.contains('btn-edit')) {
      handlers.onEdit(job);
    } else if (btn.classList.contains('btn-complete-quick')) {
      handlers.onComplete(jobId);
    } else if (btn.classList.contains('btn-delete')) {
      handlers.onDelete(jobId);
    }
  });
}

function setupMobileListeners(container, jobs, handlers) {
  const cards = container.querySelectorAll('.job-card');
  
  cards.forEach(card => {
    const jobId = card.getAttribute('data-id');
    const job = jobs.find(j => j.id === jobId);
    
    const toggleBtn = card.querySelector('.btn-toggle-expand');
    const expandable = card.querySelector('.job-card-expandable');
    const actions = card.querySelector('.job-card-actions');

    // Toggle expand
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = expandable.style.display !== 'none';
      if (isExpanded) {
        expandable.style.display = 'none';
        actions.style.display = 'none';
        toggleBtn.textContent = '•••';
        toggleBtn.style.background = 'rgba(255, 255, 255, 0.04)';
      } else {
        expandable.style.display = 'block';
        actions.style.display = 'flex';
        toggleBtn.textContent = '✕';
        toggleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    });

    // Action button listeners
    card.querySelector('.btn-mobile-advance').addEventListener('click', () => {
      handlers.onAdvance(jobId);
    });

    card.querySelector('.btn-mobile-edit').addEventListener('click', () => {
      handlers.onEdit(job);
    });

    card.querySelector('.btn-mobile-complete').addEventListener('click', () => {
      handlers.onComplete(jobId);
    });

    card.querySelector('.btn-mobile-delete').addEventListener('click', () => {
      handlers.onDelete(jobId);
    });
  });
}
