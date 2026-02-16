# Vibe OS v2.1 - Data Persistence Guide

## 🎯 Overview

**ALL DATA IN YOUR VIBE OS DASHBOARD IS AUTOMATICALLY SAVED TO THE BACKEND DATABASE.**

Every change you make is automatically synced to a secure Supabase backend with 1-second debouncing to optimize performance.

---

## 📊 What Data is Persisted?

### 1. **System Directory URLs** ✓
- **Project Docs URL** (`docsLink`)
- **GitHub Repository URL** (`ghLink`)
- **Audio Stream URL** (`spotifyLink`)

**Location in UI:** System Directory section (bottom right)  
**How to edit:** Click "EDIT_URL" button on any link  
**Storage:** Saved in `user:${userId}:settings`

---

### 2. **Today's Tasks** ✓
- Full task list with text and completion status
- Task IDs and creation timestamps
- Automatic archiving to Victory Log when completed

**Location in UI:** Today's Tasks section (left column)  
**How to manage:** Add tasks with "+" button, check to complete  
**Storage:** Saved in `user:${userId}:tasks`

---

### 3. **Victory Log (Small Wins)** ✓
- All completed achievements
- Timestamped entries
- Manual win logging available
- Full searchable archive

**Location in UI:** Small Wins section (left column)  
**How to manage:** Auto-populated from completed tasks or manual entry  
**Storage:** Saved in `user:${userId}:logs`  
**Archive:** Access via "Open Full Victory Log" button

---

### 4. **Current Project Title** ✓
- Project name displayed in hero section
- Fully editable with inline editing

**Location in UI:** Hero section - "CURRENT PROJECT" orange card  
**How to edit:** Click pencil icon or click project name  
**Storage:** Saved in `user:${userId}:settings` as `projectName`

---

### 5. **Focus Session Progress** ✓
- **Timer Sessions:** Every session ≥60 seconds is logged
- **Session Data:** Start time, end time, duration, date
- **Daily Progress:** Calculated from unique session dates
- **Total Hours:** Cumulative from all sessions
- **Days Worked:** Count of unique dates with sessions

**Location in UI:** Focus Session Progress section (right column)  
**How it works:** Automatically logged when timer stops  
**Storage:** Saved in `user:${userId}:timer_sessions`  
**Visualization:** Annual Repository heatmap shows all sessions

---

### 6. **Additional Settings** ✓
- Mission start date
- Target projects count
- Total accumulated timer seconds
- Horse reveal shuffle algorithm state

**Storage:** All in `user:${userId}:settings` or dedicated keys

---

## 🔄 How Auto-Sync Works

### Debouncing System
- **Delay:** 1 second after last change
- **Purpose:** Prevents excessive API calls
- **Indicator:** Watch for "💾 SAVED" or "⚡ SYNCING..." in top nav

### Visual Feedback
- **Top Navigation Bar:** Real-time sync status indicator
- **Toast Notifications:** Success/error messages for major operations
- **Last Save Time:** Hover over status indicator for timestamp

---

## 🛠️ Data Management Features

### Export Data
1. Click "DATA_STATUS" button in top nav (desktop) or footer link
2. Click "EXPORT DATA" button
3. Downloads JSON file: `vibe-os-backup-YYYY-MM-DD.json`
4. Contains all tasks, logs, sessions, settings

### Import Data
1. Click "DATA_STATUS" button
2. Click "IMPORT DATA" button
3. Select previously exported JSON file
4. Data is restored and synced to backend

### View Data Status
- Click "DATA_STATUS" in top navigation
- Or click footer link: "💾 VIEW DATA PERSISTENCE STATUS"
- Shows:
  - Real-time statistics
  - All saved settings
  - Data types being persisted
  - Export/import options

---

## 🔒 Security & Privacy

- **Authentication Required:** All data is user-specific
- **Encrypted Storage:** Supabase handles encryption
- **Data Isolation:** Users can only access their own data
- **Service Role Protection:** Admin keys never exposed to frontend
- **Token-Based Auth:** JWT tokens for secure API access

---

## 📝 Backend Structure

### API Endpoints
- `POST /make-server-91171845/tasks` - Save tasks
- `POST /make-server-91171845/logs` - Save victory logs
- `POST /make-server-91171845/timer-sessions` - Save focus sessions
- `POST /make-server-91171845/settings` - Save all settings
- `POST /make-server-91171845/timer` - Save timer state
- `POST /make-server-91171845/horse-shuffle` - Save reveal shuffle
- `GET /make-server-91171845/data` - Load all user data

### Database Keys
```
user:${userId}:tasks                 // Tasks array
user:${userId}:logs                  // Victory logs array
user:${userId}:timer_sessions        // Timer sessions array
user:${userId}:settings              // Settings object
user:${userId}:timer                 // Timer state object
user:${userId}:horse_reveal_shuffle  // Shuffle array
```

---

## ✅ Testing Data Persistence

### Quick Test:
1. Add a task
2. Change project name
3. Edit a URL
4. Run timer for 60+ seconds
5. Log out
6. Log back in
7. **All data should be restored!**

### Verify Auto-Sync:
- Watch for "💾 SAVED" indicator in top nav after changes
- Check browser console for successful API calls
- Open Data Status modal to see current statistics

---

## 🐛 Troubleshooting

### Data Not Saving?
- Check if you're logged in (auth required)
- Look for error toasts
- Check browser console for API errors
- Verify "💾 SAVED" appears after changes

### Data Not Loading?
- Refresh the page
- Check network connection
- Verify authentication status
- Contact support if persistent

---

## 🎨 UI Indicators

- **💾 SAVED** (Green) - Last save successful
- **⚡ SYNCING...** (Yellow) - Currently saving data
- **💾 IDLE** (Gray) - No recent changes to save
- **Blue Banner** - Data persistence info (dismissible)

---

## 📱 Data Access

All data is tied to your user account. You can access it from:
- Any device
- Any browser
- After logging out and back in
- Through export/import features

---

## 🚀 Summary

**Everything you do in Vibe OS is automatically saved:**
- ✅ Tasks you create, edit, or complete
- ✅ Victory logs (automatic and manual)
- ✅ Timer sessions and daily progress
- ✅ Project settings and URLs
- ✅ Focus time and character reveal progress
- ✅ All configuration options

**No manual save required!** Just use the app naturally and everything persists automatically.

---

*Last Updated: February 16, 2026*  
*System Version: 2.1*
