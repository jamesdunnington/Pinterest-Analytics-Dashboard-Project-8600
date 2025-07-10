import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAlertStore = create(
  persist(
    (set, get) => ({
      alerts: [],
      thresholds: {
        clicksDropPercentage: 25,
        impressionsDropPercentage: 25,
        emailNotifications: true
      },
      
      addAlert: (alert) => {
        const newAlert = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...alert
        };
        
        set(state => ({
          alerts: [newAlert, ...state.alerts].slice(0, 100) // Keep only last 100 alerts
        }));
      },
      
      markAlertAsRead: (alertId) => {
        set(state => ({
          alerts: state.alerts.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          )
        }));
      },
      
      clearAlerts: () => {
        set({ alerts: [] });
      },
      
      updateThresholds: (newThresholds) => {
        set(state => ({
          thresholds: { ...state.thresholds, ...newThresholds }
        }));
      },
      
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
      name: 'alert-storage'
    }
  )
);