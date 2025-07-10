import { create } from 'zustand';
import { subDays, format, addHours } from 'date-fns';

// Singapore timezone offset is GMT+8
const SINGAPORE_HOURS_OFFSET = 8;

// Generate sample data
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
      clickRate: (Math.random() * 5 + 1).toFixed(2)
    });
  }
  
  return data;
};

// Convert to Singapore time
const toSingaporeTime = (date) => {
  // Get the UTC time
  const utcDate = new Date(date);
  // Adjust for timezone difference to get Singapore time (GMT+8)
  return addHours(utcDate, SINGAPORE_HOURS_OFFSET);
};

export const useAnalyticsStore = create((set, get) => ({
  data: {},
  isLoading: false,
  dateRange: {
    startDate: subDays(new Date(), 30),
    endDate: new Date()
  },
  
  fetchAnalytics: async (accountIds, startDate, endDate) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newData = {};
      accountIds.forEach(accountId => {
        newData[accountId] = generateSampleData(30);
      });
      
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
  
  setDateRange: (startDate, endDate) => {
    set({ dateRange: { startDate, endDate } });
  },
  
  getFilteredData: (accountId, startDate, endDate) => {
    const accountData = get().data[accountId] || [];
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    
    return accountData.filter(item => item.date >= start && item.date <= end);
  },
  
  getCurrentSingaporeTime: () => {
    return toSingaporeTime(new Date());
  },
  
  formatSingaporeTime: (date) => {
    const singaporeTime = toSingaporeTime(date);
    return format(singaporeTime, 'yyyy-MM-dd HH:mm:ss');
  }
}));