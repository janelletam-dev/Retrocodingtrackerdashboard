# Vibe OS v2.1 🖥️

A retro-computing productivity tracker with a 90s Neo-Brutalist aesthetic, featuring warm beige backgrounds, hard black shadows, and pixel-art elements.

![Vibe OS v2.1](https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop)

## ✨ Features

### 🎯 Core Functionality
- **Focus Timer** - Track your productive sessions with a retro-styled timer
- **Task Management** - Create, complete, and archive tasks with a clean interface
- **Small Wins Log** - Celebrate and archive your victories with timestamps
- **Horse Reveal System** - Unlock pixel art characters as you complete daily sessions using Fisher-Yates shuffle algorithm
- **Activity Heatmap** - GitHub-style visualization of your daily productivity patterns
- **Sync Progress** - Track project completion (1% per unique day worked, up to 100%)

### 🔐 Backend & Data
- **Supabase Authentication** - Secure user sign-up and login
- **Real-time Data Sync** - Auto-save all productivity data with 1-second debouncing
- **User-specific Isolation** - Each user's data is completely separate
- **Session Logging** - Comprehensive tracking of all timer sessions (≥60 seconds)
- **Data Export/Import** - Full control over your productivity data

### 🎨 Design System
- **Fonts**: 
  - Press Start 2P for headers (pixel-perfect retro)
  - VT323 for body text (terminal-style monospace)
- **Color Palette**:
  - Warm beige backgrounds (`#F5E6D3`)
  - Hard black shadows for depth
  - Accent colors for different states
  - Paper-like aesthetic with grid backgrounds
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Dashboard Sections
1. **System Directory** - Quick access to Project Docs, GitHub Repo, and AudioStream
2. **Focus Timer** - Start/stop tracking with visual feedback
3. **Task Management** - Today's Tasks and Small Wins sections with unified styling
4. **Horse Reveal** - Character unlock progress visualization
5. **Annual Repository** - Full heatmap view with Days Worked, Total Sessions, and Total Hours stats
6. **Sync Progress** - Visual indicator of project completion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or compatible JavaScript runtime
- pnpm package manager
- Supabase account (for backend functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibe-os-v2.git
   cd vibe-os-v2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - The app will prompt you to enter your Supabase credentials on first run
   - Required secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Sign up for a new account or log in

## 🏗️ Project Structure

```
vibe-os-v2/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── RetroCard.tsx
│   │   │   ├── RetroButton.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   ├── SmallWinsLogModal.tsx
│   │   │   └── ...
│   │   └── App.tsx             # Main application component
│   ├── imports/                # Asset imports (SVGs, images)
│   ├── styles/
│   │   ├── theme.css           # Design tokens and theme
│   │   ├── fonts.css           # Font imports
│   │   └── globals.css         # Global styles
│   └── utils/
│       └── supabase/
│           └── info.tsx        # Supabase configuration
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx       # Hono server with API routes
│           └── kv_store.tsx    # Key-value store utilities
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Server**: Hono (running on Supabase Edge Functions)
- **Build Tool**: Vite

## 📚 Key Components

### RetroCard
A reusable card component with the signature Neo-Brutalist style - solid black borders, hard shadows, and paper-like backgrounds.

### RetroButton
Pixel-perfect buttons with hover states and consistent retro styling across all interaction points.

### Heatmap
Two visualization modes:
- **Dashboard View**: Simplified daily session tracker
- **Annual Repository**: Full GitHub-style contribution graph with statistics

### SmallWinsLogModal
A modal component for viewing timestamped archives of all completed tasks and victories.

## 🔄 Data Architecture

### Frontend → Server → Database (Three-tier)
- Frontend makes authenticated requests to Supabase Edge Functions
- Server validates auth tokens and processes requests
- Database stores user-specific data in the `kv_store_91171845` table

### Key-Value Store
All data is persisted using a flexible KV store with the following structure:
- User ID + Key = Unique identifier
- Value stored as JSON
- Supports get, set, delete, and prefix-based queries

### Auto-sync System
- 1-second debounce on all user actions
- Real-time sync indicators
- Comprehensive error handling and logging

## 🎮 Usage Guide

### Starting a Focus Session
1. Click "Start Focus" on the timer card
2. Work on your current project
3. Click "Time to rest" when done (button appears while timer is active)
4. Sessions ≥60 seconds are automatically logged

### Managing Tasks
1. Type a task in the input field under "Today's Tasks"
2. Press Enter to add
3. Click checkboxes to complete tasks
4. Completed tasks move to "Small Wins"
5. Access full victory log via "Open Full Victory Log" button

### Tracking Progress
- **Sync Progress**: Increments 1% per unique day worked (max 100%)
- **Horse Reveal**: Random pixels reveal as you complete daily sessions
- **Heatmap**: Visual representation of your productivity patterns

## 🔐 Security Notes

- All API routes require authentication
- User data is completely isolated by user ID
- Service role key is never exposed to frontend
- Secure token-based authentication via Supabase Auth

## 📝 License

MIT License - feel free to use this project for your own productivity tracking!

## 🙏 Acknowledgments

- Inspired by 90s computing aesthetics and Neo-Brutalist design
- Built with modern web technologies for a nostalgic experience
- Custom pixel art characters created specifically for this project

## 🐛 Known Issues

None at this time! The application is fully functional with complete data persistence and authentication.

## 🚧 Future Enhancements

- Additional character unlocks
- More visualization options for productivity data
- Export reports in various formats
- Team collaboration features
- Mobile app version

---

**Built with ❤️ and a lot of retro vibes**

*Vibe OS v2.1 - Because productivity should feel like 1995*
