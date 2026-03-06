# Compounded

**Compounded** is a browser-based word puzzle game where players combine words to form compound words.

Example:

```
sun + flower = sunflower
```

Players are given a prompt word and must discover all valid compound words that can be formed with it.

---

## 🎮 How to Play

1. The game shows a **prompt word**.
2. Enter a word that combines with it to form a real compound word.
3. Example:

```
apple + sauce = applesauce
rain + bow = rainbow
sun + flower = sunflower
```

4. Find all valid combinations to complete the round.

---

## ✨ Features

* Clean browser-based gameplay
* Compound word dataset generated from large dictionaries
* Accepts either the partner word or full compound
* Score tracking
* Hints and skip options
* Fully static site (no backend required)

---

## 🧠 Dataset Generation

The compound word dataset was generated using:

* Dictionary word lists
* WordNet noun filtering
* Automated compound detection
* Manual cleanup for gameplay quality

---

## 🚀 Running Locally

Start a local server:

```
python -m http.server 8000
```

Then open:

```
http://localhost:8000
```

---

## 🌐 Deployment

Because Compounded is a static site, it can be deployed easily on:

* GitHub Pages
* Netlify
* Vercel

Simply upload the files and host them.

---

## 📁 Project Structure

```
index.html
style.css
script.js
compounds-clean-edited.json
README.md
```

---

## 🎯 Future Ideas

* Daily puzzle mode
* Difficulty levels
* Timer mode
* Leaderboards
* Mobile polish

---

## 📜 License

MIT License
