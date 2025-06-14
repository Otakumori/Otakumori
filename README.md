# 🌸 Otakumori - E-commerce Super Shop : Anime & Gaming Hub

![Screenshot 2024-05-25 131107](https://github.com/user-attachments/assets/bda65d2e-09eb-4468-979a-6c8ac873cf4b)

Welcome to **Otakumori**, the ultimate blend of **anime aesthetics, interactive gamification, and a thriving otaku community**.  
A **dynamic, immersive** online store **powered by Printify**, designed for **anime lovers, gamers, and dreamers**.

---

## **Features & Integrations**

### **Gamification & Achievements**

- **Petal Collecting System** 🌸 (Collect petals through site activity)
- **Tiered Achievements** (Modeled after PlayStation trophies)
- **Ranks & Leaderboard System**

### **GameCube UI + Trade System**

- **Floating memory blocks** unlock over time
- **Steam-style trading** for collectibles & perks
- **Crafting system** for upgrading perks

### **E-Commerce with Printify**

- **Full Printify API integration**
- **Dynamic product showcase**
- **Seamless checkout & tracking**

### **Dark Souls-Style Blog System**

- **Users communicate in a lore-rich style**
- **Pre-set runic phrases, like Dark Souls messages**

### 💬 **Live Chat & Community Comments**

- **Real-time community chat**
- **Custom emoji & otaku references**
- **Admin moderation tools**

---

## 🛠️ **Tech Stack**

| **Technology**        | **Usage**                  |
| --------------------- | -------------------------- |
| **React + Vite**      | Frontend Framework         |
| **TailwindCSS**       | Styling & Animations       |
| **Supabase**          | Database & Authentication  |
| **Printify API**      | E-Commerce Backend         |
| **Vercel**            | Hosting & Deployment       |
| **Node.js + Express** | Backend (Future Expansion) |

---

## 🔗 **Follow Otakumori**

📢 **Website:** [otakumori.com](https://otakumori.com)  
📸 **Instagram:** [@otakumoriii](https://www.instagram.com/otakumoriii)  
📘 **Facebook:** [Otakumorii](https://www.facebook.com/Otakumorii)  
🎮 **Discord:** _Coming Soon_

# Otaku-m

A modern web application featuring mini-games, user progress tracking, and a beautiful cherry blossom theme.

## Features

- 🎮 Interactive mini-games
- 🌸 Cherry blossom theme
- 👤 User authentication and profiles
- 🏆 Achievement system
- 💾 Progress tracking
- 🎨 Modern, responsive design

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase
- Clerk Authentication
- Three.js
- React Three Fiber

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Otakumori.git
cd Otakumori
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# Other environment variables...
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Otakumori

A modern web application with comprehensive monitoring and maintenance capabilities.

## Features

- Real-time system monitoring dashboard
- Automated database maintenance
- System health checks
- Log rotation and management
- Performance metrics collection
- Health report generation

## Monitoring Dashboard

The monitoring dashboard provides real-time insights into system performance:

- Active users tracking
- Response time monitoring
- CPU and memory usage
- Database connection statistics
- System health status

## Maintenance Tasks

The system includes several automated maintenance tasks:

1. **Database Maintenance** (Daily at 2 AM)
   - VACUUM ANALYZE
   - REINDEX
   - Health checks

2. **System Health Check** (Every 6 hours)
   - Database connection verification
   - Cache system checks
   - Performance metrics collection

3. **Health Report Generation** (Daily at 1 AM)
   - 24-hour metrics analysis
   - System health status
   - Performance statistics

4. **Log Rotation** (Weekly on Sunday at 3 AM)
   - Log archiving
   - Log clearing
   - Compression

## Scripts

- `npm run db:maintain` - Run database maintenance
- `npm run system:check` - Check system health
- `npm run system:report` - Generate health report
- `npm run logs:rotate` - Rotate log files
- `npm run logs:clear` - Clear log files
- `npm run maintenance:schedule` - Start maintenance scheduler

## Directory Structure

- `/logs` - System logs
- `/reports` - Health reports
- `/scripts` - Maintenance scripts
- `/lib` - Utility functions
- `/app` - Application code

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Start the maintenance scheduler:
   ```bash
   npm run maintenance:schedule
   ```

## Monitoring Dashboard Access

The monitoring dashboard is available at `/admin/dashboard` and requires admin privileges to access.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

# System Monitoring and Maintenance

This project includes a comprehensive monitoring and maintenance system for tracking system health, performance metrics, and automated maintenance tasks.

## Features

- Real-time system monitoring
- Automated database maintenance
- System health checks
- Log rotation
- Performance metrics collection
- Health report generation

## Monitoring Dashboard

The monitoring dashboard provides real-time insights into:

- System metrics (CPU, memory, response time)
- Frontend performance
- Game metrics
- API performance
- Service health status

## Maintenance Tasks

### Metrics Collection
- Collects system metrics every minute
- Stores metrics in Redis for 7 days
- Tracks CPU, memory, response time, and more

### Health Checks
- Runs every 5 minutes
- Monitors service health
- Alerts on threshold violations
- Tracks database and cache status

### Log Rotation
- Runs daily at midnight
- Compresses old logs
- Removes logs older than 7 days
- Maintains disk space

## Scripts

### Development
```bash
# Start metrics collection in development mode
npm run metrics:dev

# Start health checks in development mode
npm run health:dev

# Start log rotation scheduler
npm run cron:logs
```

### Production
```bash
# Start all monitoring services
npm run monitoring:start

# Start individual services
npm run metrics:start
npm run health:start
```

## Directory Structure

```
scripts/
  ├── collect-metrics.ts     # Metrics collection
  ├── check-health.ts        # Health checks
  ├── rotate-logs.js         # Log rotation
  ├── cron-logs.js           # Log rotation scheduler
  ├── start-metrics-collector.js
  ├── start-health-check.js
  └── start-monitoring.js    # Main monitoring script

lib/
  ├── monitor.ts            # Monitoring system
  ├── redis.ts             # Redis client
  └── logger.ts            # Logging system

app/
  ├── api/
  │   ├── metrics/         # Metrics API
  │   └── health/          # Health check API
  └── admin/
      └── dashboard/       # Monitoring dashboard
```

## Environment Variables

Required environment variables:

```env
# Redis Configuration
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Application Configuration
NODE_ENV=production
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start monitoring services:
   ```bash
   npm run monitoring:start
   ```

4. Access the monitoring dashboard at `/admin/dashboard`

## Monitoring Thresholds

The system uses the following thresholds for alerts:

- CPU Usage: 80%
- Memory Usage: 85%
- Error Rate: 5%
- Response Time: 1000ms
- Database Connections: 80%
- Cache Hit Rate: 70%

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
