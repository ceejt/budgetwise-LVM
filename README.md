# BudgetWise

A comprehensive student-oriented budget tracker with income/expense tracking, goal setting, personalized financial tips, and e-wallet integration.

## Features

- 📊 Income/Expense Tracker with categories
- 🎯 Goal Tracking with progress visualization
- 💡 Personalized Financial Tips based on spending habits
- 📅 Calendar for task management
- 💳 E-wallet Integration (GCash, Maya)
- 🎨 Customizable interface
- 👤 Student and General user modes

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **UI Components**: shadcn/ui

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Supabase account (for full functionality)

## Quick Start (Demo Mode)

If you just want to test the app without setting up a database:

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Then navigate to `http://localhost:3000/demo` to access the fully functional demo dashboard.

## Full Setup (With Database & Authentication)

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd budgetwise-app

# Install dependencies
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development redirect URL for email verification
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

**Where to find these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 3. Database Setup

Run the SQL scripts in your Supabase SQL Editor (in order):

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of each script file in order:
   - `scripts/001_create_tables.sql`
   - `scripts/002_create_profile_trigger.sql`
4. Execute each script

**Option B: Using Supabase CLI**
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
\`\`\`

### 4. Configure Google OAuth (Optional)

For Google sign-in functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. In Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable Google provider
   - Paste Client ID and Client Secret

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

\`\`\`bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
\`\`\`

## Project Structure

\`\`\`
budgetwise-app/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   ├── demo/           # Demo mode (no auth required)
│   ├── settings/       # User settings
│   └── tips/           # Financial tips page
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── settings/       # Settings components
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase/       # Supabase client utilities
│   └── types.ts        # TypeScript types
├── scripts/            # Database migration scripts
└── public/             # Static assets
\`\`\`

## Database Schema

The app uses the following main tables:

- `profiles` - User profiles (student/general)
- `categories` - Expense categories
- `transactions` - Income and expenses
- `goals` - Savings and scholarship goals
- `calendar_tasks` - Calendar events
- `financial_tips` - Personalized tips
- `e_wallets` - E-wallet connections

All tables have Row Level Security (RLS) enabled for data privacy.

## Features Guide

### Demo Mode
- Access `/demo` for a fully functional demo
- All features work with local state
- No authentication required
- Perfect for testing and presentations

### Dashboard
- View expense summary with charts
- Track income sources
- Monitor goal progress
- See personalized financial tips
- Manage e-wallets

### Expense Tracking
- Add expenses with category, date, and amount
- Edit and delete transactions
- Filter by date and category
- View spending trends

### Goal Setting
- Set weekly savings goals
- Track scholarship applications
- Manage category budgets
- View progress indicators

### Personalization
- Customize tip frequency
- Set preferred currency
- Choose theme preferences
- Manage notification settings

## Deployment

### Deploy to Vercel

The easiest way to deploy:

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
\`\`\`

Or connect your GitHub repository to Vercel for automatic deployments.

**Important**: Add all environment variables in Vercel project settings.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Troubleshooting

### "Email not confirmed" error
- For testing, email verification is disabled in signup
- For production, enable email confirmation in Supabase Auth settings

### Database connection issues
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are enabled

### OAuth not working
- Verify redirect URLs are correctly configured
- Check Google OAuth credentials
- Ensure Supabase provider is enabled

## Security Notes

- All user data is protected with Row Level Security (RLS)
- Passwords are hashed by Supabase Auth
- Each user can only access their own data
- HTTPS encryption for all data transmission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for your projects!

## Support

For issues or questions:
- Check the troubleshooting section
- Review Supabase documentation
- Open an issue on GitHub

---

Built by ceejt for students managing their finances
\`\`\`

```json file="" isHidden
