import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check localStorage (fallback for local key configuration on the fly)
if (typeof window !== 'undefined') {
  const localUrl = localStorage.getItem('local_supabase_url');
  const localKey = localStorage.getItem('local_supabase_key');
  if (localUrl && localKey) {
    supabaseUrl = localUrl;
    supabaseAnonKey = localKey;
  }
}

// Check if credentials exist (optional warning, handled in main UI)
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey && 
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseAnonKey !== 'placeholder' &&
    supabaseAnonKey.trim() !== ''
  );
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

/**
 * Fetch all subcontracted jobs from Supabase, ordered by created_at descending.
 */
export async function fetchJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
  return data;
}

/**
 * Add a new subcontracted job to the database.
 * @param {Object} job 
 */
export async function addJob(job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        client_name: job.client_name,
        worker_name: job.worker_name,
        price: parseFloat(job.price),
        status: job.status || 'New',
        notes: job.notes || ''
      }
    ])
    .select();

  if (error) {
    console.error('Error adding job:', error);
    throw error;
  }
  return data[0];
}

/**
 * Update an existing job.
 * @param {string} id 
 * @param {Object} updates 
 */
export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      client_name: updates.client_name,
      worker_name: updates.worker_name,
      price: parseFloat(updates.price),
      status: updates.status,
      notes: updates.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating job:', error);
    throw error;
  }
  return data[0];
}

/**
 * Delete a job permanently.
 * @param {string} id 
 */
export async function deleteJob(id) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
  return true;
}

/**
 * Advance status of a job.
 * @param {string} id 
 * @param {string} nextStatus 
 */
export async function advanceJobStatus(id, nextStatus) {
  const { data, error } = await supabase
    .from('jobs')
    .update({ 
      status: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error advancing job status:', error);
    throw error;
  }
  return data[0];
}
