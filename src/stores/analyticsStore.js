import { create } from 'zustand';
import { subDays, format, addHours } from 'date-fns';
import { SupabaseService } from '../services/supabaseService';

// Singapore timezone offset is GMT+8
const SINGAPORE_HOURS_OFFSET = 8;

// Convert to Singapore time
const toSingaporeTime = (date) => {
  const utcDate = new Date(date);
  return addHours(utcDate, SINGAPORE_HOURS_OFFSET);
};

export const useAnalyticsStore = create((set, get) => ({
  data: {},
  isLoading: false,
  dateRange: {
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  },
  
  // Fetch analytics data from Supabase
  fetchAnalytics: async (accountIds, startDate, endDate) => {
    set({ isLoading: true });
    
    try {
      const newData = {};
      
      // Fetch data for each account
      for (const accountId of accountIds) {
        const result = await SupabaseService.getAnalyticsData(
          accountId,
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );
        
        if (result.success) {
          newData[accountId] = result.data.map(item => ({
            date: item.date,
            clicks: item.clicks,
            impressions: item.impressions,
            saves: item.saves,
            clickRate: parseFloat(item.click_rate)
          }));
        } else {
          // Fallback to sample data if no data found
          newData[accountId] = generateSampleData(30);
        }
      }
      
      set({ 
        data: newData,
        isLoading: false,
        dateRange: { startDate, endDate }
      });
      
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  
  // Generate sample data (fallback)
  generateSampleData: (days = 30) => {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      data.push({
        date: formattedDate,
        clicks: Math.floor(Math.random() * 500) + 100,
        impressions: Math.floor(Math.random() * 5000) + 1000,
        saves: Math.floor(Math.random() * 200) + 50,
        clickRate: (Math.random() * 5 + 1).toFixed(2)
      });
    }
    
    return data;
  },
  
  // Set date range
  setDateRange: (startDate, endDate) => {
    set({ dateRange: { startDate, endDate } });
  },
  
  // Get filtered data
  getFilteredData: (accountId, startDate, endDate) => {
    const accountData = get().data[accountId] || [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    
    return accountData.filter(item => item.date >= start && item.date <= end);
  },
  
  // Get current Singapore time
  getCurrentSingaporeTime: () => {
    return toSingaporeTime(new Date());
  },
  
  // Format Singapore time
  formatSingaporeTime: (date) => {
    const singaporeTime = toSingaporeTime(date);
    return format(singaporeTime, 'yyyy-MM-dd HH:mm:ss');
  }
}));

// Generate sample data function
const generateSampleData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    data.push({
      date: formattedDate,
      clicks: Math.floor(Math.random() * 500) + 100,
      impressions: Math.floor(Math.random() * 5000) + 1000,
      saves: Math.floor(Math.random() * 200) + 50,
      clickRate: parseFloat((Math.random() * 5 + 1).toFixed(2))
    });
  }
  
  return data;
};