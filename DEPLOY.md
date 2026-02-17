# Why the Figma site doesn’t show your latest changes

**retrovibecoding.figma.site** is published by **Figma Make**. It does **not** deploy from your GitHub repo.

- Figma Make can **push** code **to** GitHub (one-way: Make → GitHub).
- The **figma.site** URL is whatever Figma last published from inside Make. It does **not** pull from GitHub.
- So when you edit in VS Code and push to GitHub, the Figma-hosted site does not update.

Your code in this repo (favicon, horse image, footer link, etc.) is correct and works on localhost. To have a **live site that updates when you push**, deploy from this repo to a host that builds from GitHub.

---

# Deploy from GitHub (recommended): Vercel

Deploying this repo to **Vercel** gives you a URL that updates on every push to `main`.

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New… → Project** and import **Retrocodingtrackerdashboard** from your GitHub.
3. Leave the defaults (Build: `npm run build`, Output: `dist`).
4. Click **Deploy**.

After the first deploy you’ll get a URL like `retrocodingtrackerdashboard.vercel.app`. Every push to `main` will trigger a new deploy and that URL will show your latest code (favicon, horse at bottom, footer link, etc.).

### Optional: use your Vercel URL as the share link

In `src/app/App.tsx`, the “Copy link” button uses:

```ts
const deployedUrl = 'https://retrovibecoding.figma.site/';
```

After you have a Vercel URL, you can change this to your Vercel URL so the shared link points to the up-to-date app.

---

# If you want to keep using the Figma site

To see changes on **retrovibecoding.figma.site**, you would need to:

1. Get the latest code **into** Figma Make (e.g. re-import from GitHub or re-push from Make after pulling your repo changes into Make), and  
2. **Publish** the site again from inside Figma Make.

Figma’s flow is “Make → GitHub” and “Make → figma.site”, not “GitHub → figma.site”, so the Figma URL will only reflect what Figma last published.
