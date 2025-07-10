import CryptoJS from 'crypto-js';
import { supabase } from '../config/supabase';

export class WebCrawler {
  constructor() {
    this.userAgent = 'BusinessDirectoryBot/1.0';
  }

  async crawlBusiness(business) {
    const startTime = Date.now();
    let crawlLog = {
      business_id: business.id,
      crawl_type: 'manual',
      status: 'pending',
      url: business.website_url || business.listing_url,
      created_at: new Date().toISOString()
    };

    try {
      const url = business.website_url || business.listing_url;
      if (!url) {
        throw new Error('No URL available for crawling');
      }

      // Simulate crawling (in real implementation, you'd use a proper crawler)
      const response = await this.fetchWithTimeout(url, 10000);
      const html = await response.text();
      
      const metaTitle = this.extractMetaTitle(html);
      const metaDescription = this.extractMetaDescription(html);
      const urlHash = this.generateUrlHash(html);

      crawlLog = {
        ...crawlLog,
        status: 'success',
        meta_title: metaTitle,
        meta_description: metaDescription,
        url_hash: urlHash,
        crawl_duration: Date.now() - startTime
      };

      // Update crawl_metadata
      await this.updateCrawlMetadata(business.id, {
        url_hash: urlHash,
        meta_title: metaTitle,
        meta_description: metaDescription,
        last_crawled: new Date().toISOString(),
        crawl_status: 'success',
        error_message: null
      });

    } catch (error) {
      crawlLog = {
        ...crawlLog,
        status: 'failed',
        error_message: error.message,
        crawl_duration: Date.now() - startTime
      };

      // Update crawl_metadata with error
      await this.updateCrawlMetadata(business.id, {
        crawl_status: 'failed',
        error_message: error.message,
        last_crawled: new Date().toISOString()
      });
    }

    // Log the crawl attempt
    await this.logCrawl(crawlLog);
    return crawlLog;
  }

  async fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  extractMetaTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractMetaDescription(html) {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    return descMatch ? descMatch[1].trim() : null;
  }

  generateUrlHash(html) {
    // Generate hash from head content for change detection
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const headContent = headMatch ? headMatch[1] : html.substring(0, 1000);
    return CryptoJS.MD5(headContent.replace(/\s+/g, ' ').trim()).toString();
  }

  async updateCrawlMetadata(businessId, metadata) {
    const { error } = await supabase
      .from('crawl_metadata')
      .upsert({
        business_id: businessId,
        ...metadata,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'business_id'
      });

    if (error) {
      console.error('Error updating crawl metadata:', error);
    }
  }

  async logCrawl(crawlLog) {
    const { error } = await supabase
      .from('crawl_logs')
      .insert(crawlLog);

    if (error) {
      console.error('Error logging crawl:', error);
    }
  }

  async batchCrawl(businesses, crawlType = 'batch') {
    const results = [];
    
    for (const business of businesses) {
      const result = await this.crawlBusiness(business);
      result.crawl_type = crawlType;
      results.push(result);
      
      // Add delay between requests to be respectful
      await this.delay(1000);
    }
    
    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const crawler = new WebCrawler();