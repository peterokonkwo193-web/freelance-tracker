import './style.css';
import { fetchJobs, addJob, updateJob, deleteJob, advanceJobStatus, isSupabaseConfigured } from './lib/supabase';
import { getNextStatus } from './lib/statusConfig';
import { exportToExcel, generateWhatsAppText, copyToClipboard } from './lib/exportHelpers';
import { renderSummaryStats } from './components/SummaryStats';
import { renderFilterBar } from './components/FilterBar';
import { renderJobTable } from './components/JobTable';
import { initJobForm } from './components/JobForm';

// Global App State
const state = {
  jobs: [],
  currentFilter: 'All',
  editingJob: null,
  isDbConfigured: isSupabaseConfigured()
};

// DOM Cache
const elements = {
  statsContainer: document.getElementById('stats-container'),
  filterContainer: document.getElementById('filter-container'),
  desktopTable: document.getElementById('desktop-table-container'),
  mobileCards: document.getElementById('mobile-cards-container'),
  formOverlay: document.getElementById('job-form-overlay'),
  connectionBanner: document.getElementById('connection-banner-container'),
  
  // Header Add
  btnAddTop: document.getElementById('btn-add-job-top'),
  // FAB Add
  btnAddFab: document.getElementById('btn-add-job-fab'),
  // Exports
  btnExcel: document.getElementById('btn-export-excel'),
  btnWhatsApp: document.getElementById('btn-copy-whatsapp'),
  
  // Toast
  toast: document.getElementById('toast-notification'),
  toastMessage: document.getElementById('toast-message')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderConnectionBanner();
  
  if (state.isDbConfigured) {
    loadJobs();
  } else {
    // If not configured, render static empty views or manual dummy records
    renderUI();
  }

  setupEventListeners();
});

// Event Listeners setup
function setupEventListeners() {
  // Add Job Form triggers
  const openAddJob = () => {
    state.editingJob = null;
    openFormModal();
  };
  
  elements.btnAddTop.addEventListener('click', openAddJob);
  elements.btnAddFab.addEventListener('click', openAddJob);

  // Exports
  elements.btnExcel.addEventListener('click', () => {
    const filtered = getFilteredJobs();
    if (filtered.length === 0) {
      showToast('No jobs to export', false);
      return;
    }
    exportToExcel(filtered);
    showToast('Excel downloaded');
  });

  elements.btnWhatsApp.addEventListener('click', async () => {
    const filtered = getFilteredJobs();
    if (filtered.length === 0) {
      showToast('No jobs to format', false);
      return;
    }
    
    const stats = calculateStats(filtered);
    const text = generateWhatsAppText(filtered, stats);
    const success = await copyToClipboard(text);
    
    if (success) {
      showToast('Copied for WhatsApp!');
    } else {
      showToast('Failed to copy to clipboard', false);
    }
  });
}

// Open / Close Form Overlay Modal
function openFormModal() {
  elements.formOverlay.classList.add('active');
  elements.formOverlay.setAttribute('aria-hidden', 'false');
  
  initJobForm(elements.formOverlay, state.editingJob, {
    onSubmit: async (jobData) => {
      try {
        if (state.editingJob) {
          // Edit operation
          await updateJob(state.editingJob.id, jobData);
          showToast('Job updated successfully');
        } else {
          // Add operation
          await addJob(jobData);
          showToast('Job added successfully');
        }
        closeFormModal();
        loadJobs();
      } catch (err) {
        showToast(err.message || 'Database error occurred', false);
      }
    },
    onClose: () => {
      closeFormModal();
    }
  });
}

function closeFormModal() {
  elements.formOverlay.classList.remove('active');
  elements.formOverlay.setAttribute('aria-hidden', 'true');
  state.editingJob = null;
}

// Fetch database records
async function loadJobs() {
  try {
    state.jobs = await fetchJobs();
    renderUI();
  } catch (err) {
    showConnectionErrorBanner();
    showToast('Could not load jobs from database', false);
  }
}

// Filter logic
function getFilteredJobs() {
  if (state.currentFilter === 'All') {
    return state.jobs;
  }
  return state.jobs.filter(job => job.status === state.currentFilter);
}

// Calculate statistics for stats bar
function calculateStats(jobs) {
  const total = jobs.length;
  const active = jobs.filter(j => j.status !== 'Completed').length;
  const completed = jobs.filter(j => j.status === 'Completed').length;
  const totalPay = jobs.reduce((sum, j) => sum + parseFloat(j.price || 0), 0);
  return { total, active, completed, totalPay };
}

// Render entire UI components
function renderUI() {
  const filteredJobs = getFilteredJobs();
  
  // Render Stats
  renderSummaryStats(elements.statsContainer, state.jobs);
  
  // Render Filter Bar
  renderFilterBar(elements.filterContainer, state.currentFilter, (newFilter) => {
    state.currentFilter = newFilter;
    renderUI();
  });
  
  // Render Job Table/Cards
  renderJobTable(elements.desktopTable, elements.mobileCards, filteredJobs, {
    onAdvance: async (jobId) => {
      const job = state.jobs.find(j => j.id === jobId);
      if (!job) return;
      const nextStatus = getNextStatus(job.status);
      if (!nextStatus) return;
      
      try {
        await advanceJobStatus(jobId, nextStatus);
        showToast(`Status advanced to ${nextStatus}`);
        loadJobs();
      } catch (err) {
        showToast('Error updating status', false);
      }
    },
    onEdit: (job) => {
      state.editingJob = job;
      openFormModal();
    },
    onComplete: async (jobId) => {
      if (confirm('Mark this job as Completed?')) {
        try {
          await advanceJobStatus(jobId, 'Completed');
          showToast('Job marked Completed');
          loadJobs();
        } catch (err) {
          showToast('Error completing job', false);
        }
      }
    },
    onDelete: async (jobId) => {
      if (confirm('Delete this job? This cannot be undone.')) {
        try {
          await deleteJob(jobId);
          showToast('Job deleted successfully');
          loadJobs();
        } catch (err) {
          showToast('Error deleting job', false);
        }
      }
    }
  });
}

// Connection Banner states
function renderConnectionBanner() {
  if (!state.isDbConfigured) {
    elements.connectionBanner.innerHTML = `
      <div class="connection-banner warning" role="alert">
        <span>⚠️ <strong>Demo Mode:</strong> Supabase keys are not set up in environment variables (.env). Please click configure to update.</span>
        <button class="connection-banner-btn" id="btn-config-env">Configure Keys</button>
      </div>
    `;
    document.getElementById('btn-config-env').addEventListener('click', () => {
      const url = prompt('Enter your Supabase URL (VITE_SUPABASE_URL):', 'https://your-project.supabase.co');
      const key = prompt('Enter your Supabase Anon Key (VITE_SUPABASE_ANON_KEY):');
      if (url && key) {
        localStorage.setItem('local_supabase_url', url);
        localStorage.setItem('local_supabase_key', key);
        alert('Credentials saved locally. Page will reload.');
        window.location.reload();
      }
    });
  } else {
    elements.connectionBanner.innerHTML = '';
  }
}

function showConnectionErrorBanner() {
  elements.connectionBanner.innerHTML = `
    <div class="connection-banner" role="alert">
      <span>❌ <strong>Connection Error:</strong> Could not connect to Supabase. Check your internet connection or verify your keys in .env.</span>
      <button class="connection-banner-btn" onclick="window.location.reload()">Retry Connection</button>
    </div>
  `;
}

// Toast Feedbacks
function showToast(message, isSuccess = true) {
  elements.toastMessage.textContent = message;
  
  const successDot = elements.toast.querySelector('.toast-success-dot');
  if (isSuccess) {
    successDot.style.background = '#10b981';
    successDot.style.boxShadow = '0 0 8px #10b981';
  } else {
    successDot.style.background = '#ef4444';
    successDot.style.boxShadow = '0 0 8px #ef4444';
  }
  
  elements.toast.classList.add('show');
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

