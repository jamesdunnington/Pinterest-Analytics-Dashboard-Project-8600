import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccounts: [],
      isLoading: false,
      
      addAccount: async (accountData) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newAccount = {
            id: Date.now().toString(),
            name: accountData.name,
            username: accountData.username,
            avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000) + 1500000000000}?w=40&h=40&fit=crop&crop=face`,
            isConnected: true,
            connectedAt: new Date().toISOString(),
            lastSyncAt: new Date().toISOString(),
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
          
          return { success: true, account: newAccount };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
      
      removeAccount: (accountId) => {
        set(state => ({
          accounts: state.accounts.filter(acc => acc.id !== accountId),
          selectedAccounts: state.selectedAccounts.filter(id => id !== accountId)
        }));
      },
      
      toggleAccountSelection: (accountId) => {
        set(state => ({
          selectedAccounts: state.selectedAccounts.includes(accountId)
            ? state.selectedAccounts.filter(id => id !== accountId)
            : [...state.selectedAccounts, accountId]
        }));
      },
      
      setSelectedAccounts: (accountIds) => {
        set({ selectedAccounts: accountIds });
      },
      
      syncAccount: async (accountId) => {
        const account = get().accounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        set(state => ({
          accounts: state.accounts.map(acc =>
            acc.id === accountId
              ? { ...acc, lastSyncAt: new Date().toISOString() }
              : acc
          )
        }));
      }
    }),
    {
      name: 'account-storage'
    }
  )
);