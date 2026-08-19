# ~/dev — Sordonyx Terminal Portfolio 🚀

A retro CRT-styled, hacker-themed personal developer portfolio built with semantic HTML5, CSS3, and vanilla JavaScript. Features live GitHub API project fetching, real-time Discord presence tracking via Lanyard, Neofetch system specs, and an interactive command palette.

![Portfolio Preview](https://github.com/joeajwas.png)

---

## ⚡ Features

- **Retro CRT Aesthetic:** Custom scanlines, corner vignette shading, phosphor green glow, and an optional Matrix digital rain background.
- **Dynamic Typewriter:** Terminal typing animation showcasing roles and specialties.
- **Live GitHub Repos:** Automatically pulls public repositories from the GitHub REST API with star count, language indicators, search filter (`grep`), and sorting.
- **Interactive Command Palette (`Ctrl+K`):** Keyboard-driven command line interface for instant navigation, toggles, and shortcuts.
- **Live Discord Presence:** Real-time online status and activity powered by the Lanyard API.
- **Neofetch Specs Module:** System info and tech stack summary in terminal style.
- **Zero Framework Overhead:** Pure HTML, CSS, and vanilla JavaScript for blazing-fast load times.

---

## 📂 Project Structure

```bash
.
├── index.html     # Main markup and semantic layout
├── styles.css     # Theme variables, CRT scanlines, layouts, and animations
├── script.js      # API fetching, carousel logic, palette, and interactive scripts
└── README.md      # Repository documentation
```

---

## 🛠️ Local Development

Clone the repository:

```bash
git clone https://github.com/joeajwas/portfolio.git
cd portfolio
```

Run locally using any static server:

### Using Node.js:
```bash
npx serve .
```

### Using Python:
```bash
python3 -m http.server 3000
```

Open `http://localhost:3000` in your browser.

---

## 🚀 Deploy to Vercel

### Method 1: Via Vercel Dashboard (One-Click)

1. Push this repository to your GitHub account.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Select and import your portfolio repository.
4. Keep the default settings (Framework Preset: **Other**, Root Directory: `./`).
5. Click **Deploy**.

---

### Method 2: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the interactive terminal prompts to deploy your site in seconds.

---

## ⚙️ Configuration

To customize details for your own profile, open `script.js` and edit the `CONFIG` object:

```javascript
const CONFIG = {
  NAME: 'Sordonyx',
  GITHUB_USERNAME: 'joeajwas',
  DISCORD_USER_ID: '1018907272908374017',
  DISCORD_INVITE_URL: 'https://discord.gg/sKqXcZhNvr',
  EMAIL: 'kumarmajhi743@gmail.com',
  MATRIX_RAIN: true,
  // ...
};
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
