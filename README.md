# Gym Buddy - Workout Manager Web App

A modern, mobile-first workout management application built with Next.js 14+, TypeScript, and Prisma.

## Features

- 📱 **Mobile-first design** with responsive UI
- 🏋️ **Workout management** - Browse, search, and filter workouts
- 📊 **Progress tracking** - View stats, streaks, and achievements  
- 📅 **Workout history** - Track completed workouts over time
- ⭐ **Favorites system** - Mark and quickly access favorite workouts
- 🎯 **Categories** - Organize workouts by type (Strength, Cardio, HIIT, etc.)
- 📈 **Analytics** - Track workout frequency and duration trends

## Tech Stack

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend
- **Prisma ORM** with SQLite database
- **Server Components** for optimal performance

### Development Tools
- **ESLint** for code linting
- **GitHub Actions** for CI/CD
- **Turbopack** for fast development builds

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

The app uses three main models:

- **Workout** - Workout templates with name, description, category
- **Exercise** - Individual exercises within workouts (reps, sets, duration)
- **WorkoutCompletion** - Records of completed workouts with timestamps

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home dashboard
│   ├── workouts/          # Workout listing and details
│   ├── history/           # Workout history
│   └── progress/          # Progress tracking
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Bottom navigation
│   └── page-layout.tsx   # Page wrapper
├── lib/                  # Utilities
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Helper functions
prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Sample data
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Sample Data

The seed script includes 8 diverse workout templates across categories:

- **Strength Training** - Foundation exercises for beginners
- **Upper Body** - Chest, back, shoulders, and arms
- **Lower Body** - Legs, glutes, and calves
- **Core** - Abdominal and core strengthening
- **HIIT** - High-intensity interval training
- **Cardio** - Endurance and cardiovascular exercises
- **Flexibility** - Stretching and mobility
- **Full Body** - Complete workout circuits

## Deployment

The application can be deployed to any platform supporting Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Docker**

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.