import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupabaseService } from '../services/supabaseService';
import { useAuthStore } from './authStore';

export const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccounts: [],
      isLoading: false,

      // Fetch accounts from Supabase
      fetchAccounts: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return { success: false, error: 'User not authenticated' };

        set({ isLoading: true });
        try {
          const result = await SupabaseService.getPinterestAccounts(user.id);
          if (result.success) {
            const accounts = result.data.map(account => ({
              id: account.id,
              name: account.name,
              username: account.username,
              avatar: account.avatar_url || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1500000000000}?w=40&h=40&fit=crop&crop=face`,
              isConnected: account.is_connected,
              connectedAt: account.connected_at,
              lastSyncAt: account.last_sync_at,
              stats: {
                totalClicks: Math.floor(Math.random() * 10000) + 1000,
                totalImpressions: Math.floor(Math.random() * 100000) + 10000,
                clickRate: (Math.random() * 5 + 1).toFixed(2)
              }
            }));
            
            set({ accounts, isLoading: false });
            return { success: true, accounts };
          }
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Add new Pinterest account
      addAccount: async (accountData) => {
        const { user } = useAuthStore.getState();
        if (!user) return { success: false, error: 'User not authenticated' };

        set({ isLoading: true });
        try {
          const result = await SupabaseService.createPinterestAccount({
            user_id: user.id,
            name: accountData.name,
            username: accountData.username,
            avatar_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1500000000000}?w=40&h=40&fit=crop&crop=face`,
            pinterest_id: `pinterest_${Date.now()}`
          });

          if (result.success) {
            const newAccount = {
              id: result.data.id,
              name: result.data.name,
              username: result.data.username,
              avatar: result.data.avatar_url,
              isConnected: result.data.is_connected,
              connectedAt: result.data.connected_at,
              lastSyncAt: result.data.last_sync_at,
              stats: {
                totalClicks: Math.floor(Math.random() * 10000) + 1000,
                totalImpressions: Math.floor(Math.random() * 100000) + 10000,
                clickRate: (Math.random() * 5 + 1).toFixed(2)
              }
            };

            set(state => ({
              accounts: [...state.accounts, newAccount],
              isLoading: false
            }));

            // Generate sample analytics data
            await get().generateSampleData(newAccount.id);

            return { success: true, account: newAccount };
          }
          
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Generate sample analytics data for new account
      generateSampleData: async (accountId) => {
        try {
          const analyticsData = [];
          const now = new Date();
          
          // Generate 30 days of sample data
          for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            
            analyticsData.push({
              account_id: accountId,
              date: date.toISOString().split('T')[0],
              clicks: Math.floor(Math.random() * 500) + 100,
              impressions: Math.floor(Math.random() * 5000) + 1000,
              saves: Math.floor(Math.random() * 200) + 50,
              pin_clicks: Math.floor(Math.random() * 300) + 80,
              outbound_clicks: Math.floor(Math.random() * 150) + 30,
              click_rate: (Math.random() * 5 + 1).toFixed(2)
            });
          }
          
          await SupabaseService.bulkInsertAnalyticsData(analyticsData);
        } catch (error) {
          console.error('Error generating sample data:', error);
        }
      },

      // Remove account
      removeAccount: async (accountId) => {
        try {
          const result = await SupabaseService.deletePinterestAccount(accountId);
          if (result.success) {
            set(state => ({
              accounts: state.accounts.filter(acc => acc.id !== accountId),
              selectedAccounts: state.selectedAccounts.filter(id => id !== accountId)
            }));
            return { success: true };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Sync account
      syncAccount: async (accountId) => {
        try {
          const result = await SupabaseService.updatePinterestAccount(accountId, {
            last_sync_at: new Date().toISOString()
          });
          
          if (result.success) {
            set(state => ({
              accounts: state.accounts.map(acc => 
                acc.id === accountId 
                  ? { ...acc, lastSyncAt: result.data.last_sync_at }
                  : acc
              )
            }));
            return { success: true };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Toggle account selection
      toggleAccountSelection: (accountId) => {
        set(state => ({
          selectedAccounts: state.selectedAccounts.includes(accountId)
            ? state.selectedAccounts.filter(id => id !== accountId)
            : [...state.selectedAccounts, accountId]
        }));
      },

      // Set selected accounts
      setSelectedAccounts: (accountIds) => {
        set({ selectedAccounts: accountIds });
      }
    }),
    {
      name: 'account-storage',
      partialize: (state) => ({ 
        accounts: state.accounts,
        selectedAccounts: state.selectedAccounts 
      })
    }
  )
);