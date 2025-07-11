import supabase from '../lib/supabase';

export class SupabaseService {
  // User Management
  static async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            avatar_url: userData.avatar_url || '',
            timezone: userData.timezone || 'Asia/Singapore'
          }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Pinterest Accounts
  static async createPinterestAccount(accountData) {
    try {
      const { data, error } = await supabase
        .from('pinterest_accounts_pa2024')
        .insert([{
          user_id: accountData.user_id,
          name: accountData.name,
          username: accountData.username,
          avatar_url: accountData.avatar_url,
          pinterest_id: accountData.pinterest_id || null,
          access_token: accountData.access_token || null,
          is_connected: true,
          connected_at: new Date().toISOString(),
          last_sync_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getPinterestAccounts(userId) {
    try {
      const { data, error } = await supabase
        .from('pinterest_accounts_pa2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updatePinterestAccount(accountId, updates) {
    try {
      const { data, error } = await supabase
        .from('pinterest_accounts_pa2024')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async deletePinterestAccount(accountId) {
    try {
      const { error } = await supabase
        .from('pinterest_accounts_pa2024')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Analytics Data
  static async createAnalyticsData(analyticsData) {
    try {
      const { data, error } = await supabase
        .from('analytics_data_pa2024')
        .insert(analyticsData)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getAnalyticsData(accountId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('analytics_data_pa2024')
        .select('*')
        .eq('account_id', accountId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async bulkInsertAnalyticsData(dataArray) {
    try {
      const { data, error } = await supabase
        .from('analytics_data_pa2024')
        .insert(dataArray)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Alerts
  static async createAlert(alertData) {
    try {
      const { data, error } = await supabase
        .from('alerts_pa2024')
        .insert([{
          user_id: alertData.user_id,
          account_id: alertData.account_id,
          account_name: alertData.account_name,
          alert_type: alertData.alert_type,
          metric: alertData.metric,
          threshold_value: alertData.threshold_value,
          current_value: alertData.current_value,
          previous_value: alertData.previous_value,
          drop_percentage: alertData.drop_percentage,
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getAlerts(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('alerts_pa2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async markAlertAsRead(alertId) {
    try {
      const { data, error } = await supabase
        .from('alerts_pa2024')
        .update({ is_read: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reports
  static async createReport(reportData) {
    try {
      const { data, error } = await supabase
        .from('reports_pa2024')
        .insert([{
          user_id: reportData.user_id,
          account_ids: reportData.account_ids,
          report_type: reportData.report_type,
          format: reportData.format,
          start_date: reportData.start_date,
          end_date: reportData.end_date,
          file_path: reportData.file_path,
          file_size: reportData.file_size,
          status: 'completed',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getReports(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('reports_pa2024')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User Settings
  static async getUserSettings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_settings_pa2024')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async updateUserSettings(userId, settings) {
    try {
      const { data, error } = await supabase
        .from('user_settings_pa2024')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}