import { STATUS_SEQUENCE } from '../lib/statusConfig';

/**
 * Initializes and manages the Add/Edit form overlay.
 * @param {HTMLElement} overlayElement 
 * @param {Object|null} jobToEdit - Job object if editing, null if adding
 * @param {Object} callbacks - { onSubmit, onClose }
 */
export function initJobForm(overlayElement, jobToEdit, callbacks) {
  if (!overlayElement) return;

  const isEdit = !!jobToEdit;
  
  // Render Form HTML inside the overlay
  overlayElement.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div class="modal-header">
        <h2 id="form-title" class="modal-title">${isEdit ? 'Edit Subcontracted Job' : 'Add New Job'}</h2>
        <button type="button" class="btn-close" aria-label="Close dialog">✕</button>
      </div>

      <form id="job-form" novalidate>
        <div class="form-group">
          <label for="client-name" class="form-label">Client Name</label>
          <input type="text" id="client-name" class="form-control" placeholder="e.g. Acme Corp" maxlength="100" required>
          <span class="form-error" id="client-name-error">Client name is required (max 100 characters).</span>
        </div>

        <div class="form-group">
          <label for="worker-name" class="form-label">Worker Name</label>
          <input type="text" id="worker-name" class="form-control" placeholder="e.g. John Doe" maxlength="100" required>
          <span class="form-error" id="worker-name-error">Worker name is required (max 100 characters).</span>
        </div>

        <div class="form-group">
          <label for="job-price" class="form-label">Price (USD)</label>
          <input type="number" id="job-price" class="form-control price-input" placeholder="e.g. 250.00" min="0" step="0.01" required>
          <span class="form-error" id="job-price-error">Price must be a valid number greater than or equal to 0.</span>
        </div>

        <div class="form-group">
          <label for="job-status" class="form-label">Status</label>
          <select id="job-status" class="form-control">
            ${STATUS_SEQUENCE.map(status => `
              <option value="${status}" ${status === 'New' ? 'selected' : ''}>${status}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="job-notes" class="form-label">Notes (Optional)</label>
          <textarea id="job-notes" class="form-control" placeholder="Add follow-up notes, deliverables, or checklist..." maxlength="500"></textarea>
          <span class="form-error" id="job-notes-error">Notes cannot exceed 500 characters.</span>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-cancel" style="height: 44px;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="height: 44px; min-width: 100px;">
            ${isEdit ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  `;

  const form = overlayElement.querySelector('#job-form');
  const closeBtn = overlayElement.querySelector('.btn-close');
  const cancelBtn = overlayElement.querySelector('.btn-cancel');

  // Pre-fill if editing
  if (isEdit && jobToEdit) {
    form.querySelector('#client-name').value = jobToEdit.client_name || '';
    form.querySelector('#worker-name').value = jobToEdit.worker_name || '';
    form.querySelector('#job-price').value = jobToEdit.price || '0';
    form.querySelector('#job-status').value = jobToEdit.status || 'New';
    form.querySelector('#job-notes').value = jobToEdit.notes || '';
  }

  // Focus the first input field
  setTimeout(() => {
    form.querySelector('#client-name').focus();
  }, 100);

  // Close triggers
  const handleClose = () => {
    overlayElement.classList.remove('active');
    setTimeout(() => {
      callbacks.onClose();
    }, 300); // Wait for transition
  };

  closeBtn.addEventListener('click', handleClose);
  cancelBtn.addEventListener('click', handleClose);

  // Overlay click to close (optional but user-friendly)
  overlayElement.addEventListener('click', (e) => {
    if (e.target === overlayElement) {
      handleClose();
    }
  });

  // Submit trigger
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    form.querySelectorAll('.form-error').forEach(err => err.style.display = 'none');
    form.querySelectorAll('.form-control').forEach(ctrl => ctrl.style.borderColor = '');

    const clientNameInput = form.querySelector('#client-name');
    const workerNameInput = form.querySelector('#worker-name');
    const priceInput = form.querySelector('#job-price');
    const statusInput = form.querySelector('#job-status');
    const notesInput = form.querySelector('#job-notes');

    let isValid = true;

    // Validation
    const clientName = clientNameInput.value.trim();
    if (!clientName || clientName.length > 100) {
      isValid = false;
      showInputError(clientNameInput, 'client-name-error');
    }

    const workerName = workerNameInput.value.trim();
    if (!workerName || workerName.length > 100) {
      isValid = false;
      showInputError(workerNameInput, 'worker-name-error');
    }

    const priceVal = parseFloat(priceInput.value);
    if (isNaN(priceVal) || priceVal < 0) {
      isValid = false;
      showInputError(priceInput, 'job-price-error');
    }

    const notes = notesInput.value.trim();
    if (notes.length > 500) {
      isValid = false;
      showInputError(notesInput, 'job-notes-error');
    }

    if (!isValid) return;

    // Build payload
    const jobData = {
      client_name: clientName,
      worker_name: workerName,
      price: parseFloat(priceVal.toFixed(2)),
      status: statusInput.value,
      notes: notes
    };

    callbacks.onSubmit(jobData);
  });
}

function showInputError(inputEl, errorId) {
  inputEl.style.borderColor = '#ef4444';
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.style.display = 'block';
  }
}
