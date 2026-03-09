# ⬡ CodeCard — Code-to-Card Generator

Convert your code snippets into beautiful, shareable images for Twitter, LinkedIn, or your blog.

---

## 🚀 How to Run Locally

### Option 1 – Just open the file (simplest)
```
Open index.html in any modern browser.
```
> No server needed. All assets load from CDN.

### Option 2 – Local dev server (recommended for best results)
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using VS Code
Install the "Live Server" extension → right-click index.html → Open with Live Server
```
Then visit: `http://localhost:8080`

---

## ✨ Features

| Feature | Details |
|---|---|
| Syntax Highlighting | Prism.js — 10 languages supported |
| Live Preview | Real-time card preview as you type |
| Customisation | Gradient, padding, radius, font size, window style, theme |
| Presets | Twitter, LinkedIn, Minimal, Neon, Sunset, Ocean |
| Save Presets | Saved to localStorage — persist between sessions |
| Random Gradient | 16 handpicked colour pairs |
| Export PNG | html2canvas at 3× resolution for crisp output |
| Copy Code | One-click clipboard copy |
| Keyboard Shortcuts | `Ctrl+Shift+E` export, `Ctrl+Shift+C` copy |

---

## 🗂 Project Structure

```
/code-to-card
├── index.html    — App shell, HTML structure
├── styles.css    — App UI styles (dark industrial theme)
├── preview.css   — Card/preview component styles
├── script.js     — All JavaScript logic
└── README.md     — This file
```

---

## 🖥 Supported Languages
JavaScript · TypeScript · Python · CSS · HTML · Bash · Java · C# · Rust · Go

---

## 📦 External Dependencies (CDN)
- [Prism.js](https://prismjs.com/) — Syntax highlighting
- [html2canvas](https://html2canvas.hertzen.com/) — PNG export
- [Google Fonts](https://fonts.google.com/) — Syne + JetBrains Mono
