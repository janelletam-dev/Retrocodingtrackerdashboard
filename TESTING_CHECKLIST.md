# Vibe OS v2.1 - Data Persistence Testing Checklist

## ✅ Visual Verification

### 1. Top Navigation Sync Indicator
- [ ] Look for sync status indicator in top navigation bar (desktop)
- [ ] Should show one of: "💾 IDLE", "⚡ SYNCING...", or "💾 SAVED"
- [ ] Hover over indicator to see last save timestamp
- [ ] Indicator appears after logging in

### 2. Data Status Button
- [ ] "DATA_STATUS" button visible in top nav (large screens only)
- [ ] Blue button with database icon
- [ ] Clicking opens Data Status Modal

### 3. Data Persistence Banner
- [ ] Blue banner appears below hero section on first login
- [ ] Shows "💾 AUTO-SYNC ENABLED" message
- [ ] Lists what's being saved (TASKS, VICTORIES, etc.)
- [ ] Can be dismissed with × button
- [ ] Contains "VIEW FULL DATA STATUS →" link

### 4. Footer Link
- [ ] Footer shows "💾 VIEW DATA PERSISTENCE STATUS" link
- [ ] Only visible when authenticated
- [ ] Clicking opens Data Status Modal

---

## 🧪 Functional Testing

### Test 1: System Directory URLs
1. Navigate to SYSTEM_DIRECTORY section (bottom right)
2. Click "EDIT_URL" on any of the three links:
   - PROJECT_DOCS
   - GITHUB_REPOSITORY
   - AUDIO_STREAM
3. Change the URL
4. Click "SAVE"
5. **Expected:** Watch for "💾 SAVED" indicator in top nav
6. Refresh page or log out/in
7. **Expected:** URL changes should persist

### Test 2: Today's Tasks
1. Add a new task in "Today's Tasks" section
2. **Expected:** "💾 SAVED" appears after 1 second
3. Add multiple tasks
4. Complete a task by clicking checkbox
5. **Expected:** Task moves to "Small Wins"
6. Refresh page
7. **Expected:** All tasks remain, completed task is in Small Wins

### Test 3: Victory Log
1. Manually add a win in "Small Wins" section
2. **Expected:** "💾 SAVED" indicator appears
3. Complete a task (auto-logs to victories)
4. Click "Open Full Victory Log"
5. **Expected:** All wins are timestamped and displayed
6. Log out and back in
7. **Expected:** All wins still present

### Test 4: Current Project Title
1. Click pencil icon next to project name (hero section)
2. Change project name
3. Press Enter or click checkmark
4. **Expected:** "💾 SAVED" appears
5. Refresh page
6. **Expected:** New project name persists

### Test 5: Focus Session Progress
1. Click "INITIATE" to start timer
2. Let it run for at least 60 seconds
3. Click "PAUSE" to stop
4. **Expected:** Toast notification about logged session
5. Check "Days Worked" counter
6. **Expected:** Should increment for unique days
7. Click "Open Full Annual Repository"
8. **Expected:** Heatmap shows session data
9. Log out and log back in
10. **Expected:** Session history preserved

### Test 6: Data Status Modal
1. Click "DATA_STATUS" button or footer link
2. **Expected:** Modal opens with comprehensive stats
3. Verify displayed counts:
   - Today's Tasks count
   - Victory Log count
   - Timer Sessions count
   - Days Worked count
4. Verify "SAVED SETTINGS" section shows:
   - Project Name
   - Mission Start
   - Target Projects
   - All three URLs
5. **Expected:** All values match current app state

### Test 7: Data Export
1. Open Data Status Modal
2. Click "EXPORT DATA"
3. **Expected:** JSON file downloads
4. Open file in text editor
5. **Expected:** Contains all app data in structured format
6. Verify presence of:
   - tasks array
   - logs array
   - timerSessions array
   - settings object
   - exportedAt timestamp

### Test 8: Data Import
1. Make some changes (add tasks, change project name)
2. Export data
3. Make different changes
4. Click "IMPORT DATA" in Data Status Modal
5. Select previously exported file
6. **Expected:** "Data imported successfully!" toast
7. **Expected:** App state reverts to exported snapshot
8. **Expected:** Imported data syncs to backend

### Test 9: Full Persistence Flow
1. While logged in:
   - Add 3 tasks
   - Change project name
   - Edit all 3 directory URLs
   - Run timer for 60+ seconds
   - Add 2 manual victories
   - Change target projects number
2. Note all current values
3. Log out completely
4. Log back in
5. **Expected:** ALL changes are preserved:
   - All 3 tasks present
   - Project name matches
   - All URLs updated
   - Timer session logged
   - 2 victories in Small Wins
   - Target projects matches

---

## 🎯 Performance Testing

### Debouncing Verification
1. Rapidly change project name (type quickly)
2. **Expected:** Indicator shows "⚡ SYNCING..." briefly
3. **Expected:** Only saves after 1 second of inactivity
4. Check browser Network tab
5. **Expected:** API calls are debounced (not sent for every keystroke)

### Multiple Changes
1. Make several changes in quick succession:
   - Add task
   - Change URL
   - Change project name
2. **Expected:** Each saves independently after 1 second
3. **Expected:** "💾 SAVED" appears after last change settles

---

## 🔒 Security Testing

### Data Isolation
1. Log in as User A
2. Add tasks, change settings
3. Note User A's data
4. Log out
5. Log in as User B (different account)
6. **Expected:** Clean slate (User A's data NOT visible)
7. Add different data
8. Log out
9. Log back in as User A
10. **Expected:** User A's original data intact

---

## 📊 Data Status Modal Details

### Should Display:
- ✅ "ALL DATA SYNCED" green banner
- ✅ Auto-save features list
- ✅ Data Statistics cards:
  - Today's Tasks count
  - Victory Log count
  - Timer Sessions count
  - Days Worked count
- ✅ Saved Settings table with 6 items
- ✅ "What's Being Saved?" section with 6 items
- ✅ Export/Import buttons
- ✅ Close button

---

## 🐛 Error Scenarios

### Network Failure
1. Disconnect internet
2. Make changes (add task)
3. **Expected:** Changes remain in UI
4. **Expected:** May see error toast
5. Reconnect internet
6. Refresh page
7. **Expected:** Last saved state loads (not disconnected changes)

### Session Expiry
1. Log in
2. Wait for session to expire
3. Make changes
4. **Expected:** May redirect to login or show error
5. Log back in
6. **Expected:** Changes made before expiry are preserved

---

## 📱 Cross-Session Testing

1. Open app in Browser A (Chrome), log in
2. Add tasks and make changes
3. Without logging out, open app in Browser B (Firefox)
4. Log in with same credentials
5. **Expected:** Browser B shows all data from Browser A
6. Make changes in Browser B
7. Refresh Browser A
8. **Expected:** Browser A shows Browser B's changes

---

## ✨ Success Criteria

All tests pass if:
- ✅ Sync indicator works and shows status
- ✅ Data Status Modal opens and displays correctly
- ✅ All data types persist across sessions
- ✅ Export produces valid JSON
- ✅ Import restores data correctly
- ✅ Changes sync within 1-2 seconds
- ✅ Data is user-specific (isolated)
- ✅ No console errors during normal operation
- ✅ Toast notifications appear for major actions

---

*Use this checklist to verify that all data persistence features are working correctly.*
