# 🌸 Otaku-mori - Anime Community Platform

A comprehensive anime community platform built with Next.js, featuring user profiles, achievements, admin tools, community features, and more.

## ✨ Features

### 🎮 Core Features

- **Memory Cube Boot Sequence** - Interactive startup animation with audio
- **Achievement System** - Comprehensive achievement tracking with custom icons and petal tiers
- **Profile System** - Rich user profiles with avatar customization and stats
- **NSFW Gating** - Age verification and content filtering system
- **Cherry Blossom Effects** - Beautiful sakura petal animations throughout the site

### 👥 Community Features

- **Echo Well** - Social media-style community interactions
- **Petalnotes** - Collaborative knowledge sharing platform
- **Friend System** - User connections and activity tracking
- **Community Gallery** - User-generated content showcase

### 🛍️ E-commerce

- **Shop Management** - Product catalog with inventory tracking
- **Cart System** - Shopping cart with persistent state
- **Order Management** - Complete order processing workflow
- **Printify Integration** - Print-on-demand product fulfillment

### 🛠️ Admin Dashboard

- **User Management** - Complete user administration with bulk actions
- **Content Moderation** - Flagged content and user report management
- **Analytics Dashboard** - Comprehensive site analytics and metrics
- **Blog Management** - Content creation and publishing tools
- **Shop Administration** - Product and order management
- **Bulk Actions** - Mass operations for efficiency

### 📊 Analytics & Monitoring

- **Real-time Metrics** - User activity, revenue, and engagement tracking
- **Performance Monitoring** - System health and error tracking
- **SEO Optimization** - Search engine optimization tools
- **Export Capabilities** - Data export for external analysis

### 🌍 Internationalization

- **Multi-language Support** - English, Japanese, Korean, Chinese, Spanish, French, German, Portuguese
- **Language Switcher** - Easy language selection with native names
- **Localized Content** - Region-specific content and formatting

### 📱 Mobile Experience

- **Mobile Navigation** - Bottom navigation and side menu
- **Responsive Design** - Optimized for all screen sizes
- **Touch Interactions** - Mobile-friendly gestures and interactions
- **Progressive Web App** - App-like experience on mobile devices

### 🔔 Notifications & Feedback

- **Toast System** - Comprehensive notification system
- **Achievement Notifications** - Real-time achievement unlocks
- **Sound Effects** - Audio feedback for interactions
- **Haptic Feedback** - Mobile vibration feedback

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/Otakumori.git
cd Otakumori
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Set up the database**

```bash
npm run db:setup
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
Otakumori/
├── app/                          # Next.js 13+ app directory
│   ├── (auth)/                   # Authentication routes
│   ├── (client)/                 # Client-side routes
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   ├── components/               # Reusable components
│   │   ├── achievements/         # Achievement system
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── community/            # Community features
│   │   ├── i18n/                 # Internationalization
│   │   ├── mobile/               # Mobile components
│   │   ├── notifications/        # Notification system
│   │   └── ui/                   # UI components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utility libraries
│   └── types/                    # TypeScript types
├── public/                       # Static assets
├── supabase/                     # Database migrations
└── scripts/                      # Utility scripts
```

## 🎨 Key Components

### Achievement System

- **AchievementCard** - Individual achievement display
- **AchievementCategories** - Achievement organization
- **AchievementDetails** - Detailed achievement information
- **AchievementContext** - Global achievement state management

### Admin Dashboard

- **User Management** - Complete user administration
- **Content Moderation** - Flagged content handling
- **Analytics Dashboard** - Site metrics and charts
- **Shop Management** - Product and order administration

### Community Features

- **Echo Well** - Social media interactions
- **Petalnotes** - Collaborative knowledge sharing
- **Friend System** - User connections
- **Community Gallery** - Content showcase

### Mobile Experience

- **MobileNavigation** - Mobile-optimized navigation
- **Bottom Navigation** - App-like bottom navigation
- **Side Menu** - Slide-out navigation menu
- **Touch Interactions** - Mobile-friendly interactions

## 🔧 API Endpoints

### Admin APIs

- `GET/POST /api/admin/users` - User management
- `GET/POST /api/admin/blog` - Blog management
- `GET/POST /api/admin/shop` - Shop management
- `GET/POST /api/admin/moderation` - Content moderation

### User APIs

- `GET/POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/profile` - Profile management
- `GET/POST /api/achievements` - Achievement system

### Community APIs

- `GET/POST /api/community/echoes` - Echo Well
- `GET/POST /api/community/petalnotes` - Petalnotes
- `GET/POST /api/community/friends` - Friend system

## 🎯 Achievement System

The achievement system features:

- **Custom Icons** - Unique achievement artwork
- **Petal Tiers** - Bronze, Silver, Gold, Platinum, Diamond
- **Categories** - Community, Gaming, Collection, Social
- **Progress Tracking** - Real-time achievement progress
- **Sound Effects** - Achievement unlock audio
- **Notifications** - Toast notifications for unlocks

## 🌸 Cherry Blossom Theme

The site features a beautiful cherry blossom aesthetic:

- **Petal Animations** - Drifting sakura petals
- **Seasonal Changes** - Dynamic theming based on seasons
- **Mood System** - Different petal behaviors based on user mood
- **Interactive Elements** - Clickable petals with effects

## 📱 Mobile Optimization

Mobile features include:

- **Bottom Navigation** - Easy thumb navigation
- **Side Menu** - Comprehensive navigation menu
- **Touch Gestures** - Swipe and tap interactions
- **Responsive Design** - Optimized for all screen sizes
- **Progressive Web App** - App-like experience

## 🌍 Internationalization

Multi-language support includes:

- **8 Languages** - English, Japanese, Korean, Chinese, Spanish, French, German, Portuguese
- **Native Names** - Language names in their native script
- **Flag Icons** - Visual language identification
- **Easy Switching** - One-click language changes

## 🔔 Notification System

Comprehensive notification features:

- **Toast Notifications** - Non-intrusive message display
- **Multiple Types** - Success, error, warning, info
- **Auto-dismiss** - Automatic notification cleanup
- **Action Buttons** - Interactive notification actions
- **Sound Integration** - Audio notification support

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run db:setup     # Setup database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

### Code Style

- **TypeScript** - Full type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS** - Utility-first styling

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Backend as a service
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Framer Motion** - Animation library

## 📞 Support

For support, email support@otaku-mori.com or join our Discord community.

---

**Built with ❤️ for the anime community**
