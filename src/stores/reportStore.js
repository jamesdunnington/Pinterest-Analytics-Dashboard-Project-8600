import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useReportStore = create(
  persist(
    (set, get) => ({
      settings: {
        weeklyReports: true,
        emailAddress: '',
        reportFormat: 'pdf', // 'pdf' or 'csv'
        includeCharts: true,
        includeAlerts: true
      },
      
      reportHistory: [],
      isGenerating: false,
      
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      generateReport: async (accountIds, startDate, endDate, format = 'pdf') => {
        set({ isGenerating: true });
        
        try {
          // Simulate report generation
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const report = {
            id: Date.now().toString(),
            accountIds,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            format,
            generatedAt: new Date().toISOString(),
            downloadUrl: `#report-${Date.now()}`,
            size: Math.floor(Math.random() * 1000) + 100 // KB
          };
          
          set(state => ({
            reportHistory: [report, ...state.reportHistory].slice(0, 50),
            isGenerating: false
          }));
          
          return { success: true, report };
        } catch (error) {
          set({ isGenerating: false });
          return { success: false, error: error.message };
        }
      },
      
      scheduleWeeklyReport: async () => {
        // This would integrate with a backend service
        return { success: true };
      }
    }),
    {
      name: 'report-storage'
    }
  )
);