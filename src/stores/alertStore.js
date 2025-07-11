import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupabaseService } from '../services/supabaseService';
import { useAuthStore } from './authStore';

export const useAlertStore = create(
  persist(
    (set, get) => ({
      alerts: [],
      thresholds: {
        clicksDropPercentage: 25,
        impressionsDropPercentage: 25,
        emailNotifications: true
      },

      // Fetch alerts from Supabase
      fetchAlerts: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
          const result = await SupabaseService.getAlerts(user.id);
          if (result.success) {
            const alerts = result.data.map(alert => ({
              id: alert.id,
              type: alert.alert_type,
              accountId: alert.account_id,
              accountName: alert.account_name,
              metric: alert.metric,
              dropPercentage: parseFloat(alert.drop_percentage),
              currentValue: alert.current_value,
              previousValue: alert.previous_value,
              threshold: parseFloat(alert.threshold_value),
              isRead: alert.is_read,
              timestamp: alert.created_at
            }));
            
            set({ alerts });
            return { success: true, alerts };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Add new alert
      addAlert: async (alert) => {
        const { user } = useAuthStore.getState();
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
          const result = await SupabaseService.createAlert({
            user_id: user.id,
            account_id: alert.accountId,
            account_name: alert.accountName,
            alert_type: alert.type,
            metric: alert.metric,
            threshold_value: alert.threshold,
            current_value: alert.currentValue,
            previous_value: alert.previousValue,
            drop_percentage: alert.dropPercentage
          });

          if (result.success) {
            const newAlert = {
              id: result.data.id,
              type: result.data.alert_type,
              accountId: result.data.account_id,
              accountName: result.data.account_name,
              metric: result.data.metric,
              dropPercentage: parseFloat(result.data.drop_percentage),
              currentValue: result.data.current_value,
              previousValue: result.data.previous_value,
              threshold: parseFloat(result.data.threshold_value),
              isRead: result.data.is_read,
              timestamp: result.data.created_at
            };

            set(state => ({
              alerts: [newAlert, ...state.alerts].slice(0, 100)
            }));

            return { success: true, alert: newAlert };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Mark alert as read
      markAlertAsRead: async (alertId) => {
        try {
          const result = await SupabaseService.markAlertAsRead(alertId);
          if (result.success) {
            set(state => ({
              alerts: state.alerts.map(alert =>
                alert.id === alertId ? { ...alert, isRead: true } : alert
              )
            }));
            return { success: true };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Clear all alerts
      clearAlerts: () => {
        set({ alerts: [] });
      },

      // Update thresholds
      updateThresholds: async (newThresholds) => {
        const { user } = useAuthStore.getState();
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
          const result = await SupabaseService.updateUserSettings(user.id, {
            clicks_threshold: newThresholds.clicksDropPercentage,
            impressions_threshold: newThresholds.impressionsDropPercentage,
            email_notifications: newThresholds.emailNotifications
          });

          if (result.success) {
            set(state => ({
              thresholds: { ...state.thresholds, ...newThresholds }
            }));
            return { success: true };
          }
          return result;
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Check thresholds (simplified version)
      checkThresholds: (accountId, accountName, currentData, previousData) => {
        const { thresholds } = get();
        const alerts = [];

        // Check clicks drop
        if (previousData.clicks > 0) {
          const clicksDropPercentage = ((previousData.clicks - currentData.clicks) / previousData.clicks) * 100;
          if (clicksDropPercentage > thresholds.clicksDropPercentage) {
            alerts.push({
              type: 'clicks_drop',
              accountId,
              accountName,
              metric: 'clicks',
              dropPercentage: clicksDropPercentage.toFixed(1),
              currentValue: currentData.clicks,
              previousValue: previousData.clicks,
              threshold: thresholds.clicksDropPercentage
            });
          }
        }

        // Check impressions drop
        if (previousData.impressions > 0) {
          const impressionsDropPercentage = ((previousData.impressions - currentData.impressions) / previousData.impressions) * 100;
          if (impressionsDropPercentage > thresholds.impressionsDropPercentage) {
            alerts.push({
              type: 'impressions_drop',
              accountId,
              accountName,
              metric: 'impressions',
              dropPercentage: impressionsDropPercentage.toFixed(1),
              currentValue: currentData.impressions,
              previousValue: previousData.impressions,
              threshold: thresholds.impressionsDropPercentage
            });
          }
        }

        // Add alerts
        alerts.forEach(alert => get().addAlert(alert));
        return alerts;
      }
    }),
    {
      name: 'alert-storage',
      partialize: (state) => ({ 
        alerts: state.alerts,
        thresholds: state.thresholds 
      })
    }
  )
);