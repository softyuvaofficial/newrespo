import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ylpahtavddtsptdcpryx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscGFodGF2ZGR0c3B0ZGNwcnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODk3MjYsImV4cCI6MjA2ODI2NTcyNn0.xj1VYpCxtxuJVpALenIh3vkNmHC4Bt07ItiFNf7UoLc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseOperations = {
  // Auth operations
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Test Series operations
  async getTestSeries() {
    const { data, error } = await supabase
      .from('test_series')
      .select(`
        *,
        categories (name),
        test_tabs (*)
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getTestSeriesById(id) {
    const { data, error } = await supabase
      .from('test_series')
      .select(`
        *,
        categories (name),
        test_tabs (*)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Questions operations
  async getQuestions(testId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('question_number');
    return { data, error };
  },

  // Results operations
  async saveTestResult(resultData) {
    const { data, error } = await supabase
      .from('test_results')
      .insert([resultData]);
    return { data, error };
  },

  // Categories operations
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    return { data, error };
  }
};

export default supabase;