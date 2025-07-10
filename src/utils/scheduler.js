// VEVENT schedule for weekly crawl
export const CRAWL_SCHEDULE = `
BEGIN:VEVENT
DTSTART;TZID=Asia/Singapore:20241201T030000
RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=3;BYMINUTE=0;BYSECOND=0
SUMMARY:Business Directory Weekly Crawl
DESCRIPTION:Automated weekly crawl of all active business listings
END:VEVENT
`;

export class CrawlScheduler {
  constructor() {
    this.isRunning = false;
    this.nextRun = null;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleNextRun();
  }

  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.nextRun = null;
  }

  scheduleNextRun() {
    const now = new Date();
    const nextMonday = this.getNextMonday(now);
    
    // Set to 3:00 AM Singapore time
    nextMonday.setHours(3, 0, 0, 0);
    
    // Convert to local time
    const singaporeOffset = 8 * 60; // Singapore is UTC+8
    const localOffset = now.getTimezoneOffset();
    const timeDiff = (singaporeOffset + localOffset) * 60 * 1000;
    
    const localTime = new Date(nextMonday.getTime() - timeDiff);
    
    this.nextRun = localTime;
    const delay = localTime.getTime() - now.getTime();
    
    this.intervalId = setTimeout(() => {
      this.executeCrawl();
      this.scheduleNextRun(); // Schedule next week
    }, delay);
  }

  getNextMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay();
    const daysUntilMonday = day === 0 ? 1 : (8 - day); // 0 = Sunday
    
    if (day === 1 && date.getHours() < 3) {
      // If it's Monday and before 3 AM, use today
      return monday;
    }
    
    monday.setDate(monday.getDate() + daysUntilMonday);
    return monday;
  }

  async executeCrawl() {
    try {
      console.log('Starting scheduled crawl at:', new Date().toISOString());
      
      // Import crawler here to avoid circular dependencies
      const { crawler } = await import('./crawler');
      const { supabase } = await import('../config/supabase');
      
      // Get all active businesses
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching businesses for scheduled crawl:', error);
        return;
      }

      // Execute batch crawl
      const results = await crawler.batchCrawl(businesses, 'scheduled');
      
      console.log(`Scheduled crawl completed. Processed ${results.length} businesses.`);
      
    } catch (error) {
      console.error('Error in scheduled crawl:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.nextRun,
      schedule: 'Every Monday at 3:00 AM Singapore time'
    };
  }
}

export const scheduler = new CrawlScheduler();