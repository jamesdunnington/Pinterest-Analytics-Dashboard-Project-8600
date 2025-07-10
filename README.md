# Business Directory with Supabase

A comprehensive business directory application with web crawling capabilities, CSV import/export, and admin management features.

## Features

### Directory Search
- Browse and filter businesses by category, location, and keywords
- Full-text search with PostgreSQL indexes
- Pagination optimized for 10,000+ listings
- Responsive design with greenish-blue theme

### Crawl & Update System
- Weekly scheduled crawls (Monday 3:00 AM Singapore time)
- URL hash-based change detection
- Meta title and description extraction
- Comprehensive crawl logging and error tracking
- Manual re-crawl capabilities

### CSV Import/Export
- Batch upload of business listings
- Data validation and error reporting
- Sample CSV template generation
- Support for standard directory columns

### Admin Dashboard
- System statistics and monitoring
- Database schema management
- Crawl scheduler control
- Performance metrics

## Architecture

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Responsive design patterns

### Backend
- Supabase PostgreSQL database
- Row Level Security (RLS)
- Full-text search indexes
- Automated triggers and functions

### Database Schema

#### businesses
- Core business information
- Full-text search indexes
- Category and location filtering

#### crawl_metadata
- URL hash storage for change detection
- Meta title and description
- Crawl status tracking

#### crawl_logs
- Detailed crawl history
- Error logging and debugging
- Performance metrics

## Setup Instructions

1. **Environment Variables**
   Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Database Setup**
   Run the schema SQL from `src/config/supabase.js` in your Supabase SQL editor.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## CSV Import Format

### Required Columns
- `name` - Business name
- `category` - Business category
- `location` - Business location

### Optional Columns
- `website_url` - Business website
- `listing_url` - Directory listing URL
- `contact_email` - Contact email
- `description` - Business description

## Crawl Schedule

The system uses a VEVENT-compatible schedule:

```
BEGIN:VEVENT
DTSTART;TZID=Asia/Singapore:20241201T030000
RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=3;BYMINUTE=0;BYSECOND=0
SUMMARY:Business Directory Weekly Crawl
DESCRIPTION:Automated weekly crawl of all active business listings
END:VEVENT
```

## Deployment

### Supabase Free Tier
- Single region deployment
- 500MB database storage
- 2GB bandwidth per month
- Real-time subscriptions

### Vercel/Netlify
- Static site deployment
- Environment variable configuration
- Automatic builds from Git

## Performance Optimizations

- Database indexes for search and filtering
- Pagination for large datasets
- Lazy loading and code splitting
- Optimized bundle size
- Responsive image handling

## Security Features

- Row Level Security (RLS)
- Input validation and sanitization
- CORS configuration
- Rate limiting (via Supabase)
- Secure environment variables

## Monitoring

- Crawl success/failure rates
- Database query performance
- User activity tracking
- Error logging and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details