import * as XLSX from 'xlsx';

// Emoji mapping for WhatsApp status badges
const STATUS_EMOJIS = {
  'New': '⚪',
  'Started': '🔵',
  'Confirmed': '🟠',
  'Milestone Cleared': '🟣',
  'Completed': '🟢'
};

/**
 * Format a number as USD currency.
 * @param {number} value 
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

/**
 * Format date string to YYYY-MM-DD.
 * @param {string} dateStr 
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

/**
 * Generates and downloads an Excel file of the provided jobs.
 * @param {Array} jobs 
 */
export function exportToExcel(jobs) {
  // Map jobs to clean sheet format
  const rows = jobs.map(job => ({
    'Client': job.client_name,
    'Worker': job.worker_name,
    'Price (USD)': parseFloat(job.price),
    'Status': job.status,
    'Notes': job.notes || '',
    'Created Date': formatDate(job.created_at)
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Freelance Jobs');

  // Adjust column widths automatically
  const maxW = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }];
  worksheet['!cols'] = maxW;

  // Generate filename
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `freelance-jobs-${todayStr}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates WhatsApp clipboard-ready text.
 * @param {Array} jobs 
 * @param {Object} stats - { total, active, completed, totalPay }
 */
export function generateWhatsAppText(jobs, stats) {
  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let text = `📋 *Freelance Jobs — ${todayStr}*\n\n`;

  if (jobs.length === 0) {
    text += '_No jobs found in the current view._\n\n';
  } else {
    jobs.forEach((job, index) => {
      const emoji = STATUS_EMOJIS[job.status] || '⚪';
      const formattedPrice = formatCurrency(job.price);
      text += `${index + 1}. *${job.client_name}* → ${job.worker_name}\n`;
      text += `   💰 ${formattedPrice} | ${emoji} ${job.status}\n`;
      if (job.notes && job.notes.trim() !== '') {
        // Clean line breaks inside notes
        const cleanNotes = job.notes.trim().replace(/\n/g, '\n   ');
        text += `   📝 _${cleanNotes}_\n`;
      }
      text += `\n`;
    });
  }

  text += `---\n`;
  text += `Total Jobs: ${stats.total} | Active: ${stats.active} | Total Pay: ${formatCurrency(stats.totalPay)}`;

  return text;
}

/**
 * Copies text to the clipboard.
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
