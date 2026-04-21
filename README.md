# Compounded

**Compounded** is a static, browser-based word puzzle. You get a **prompt word** and find **partner words** that combine with it to form real compound words (for example, `sun` + `flower` → `sunflower`). The game loads a JSON dataset and runs entirely in the browser—no backend.

## How to play

1. Read the **prompt word** on screen.
2. Type a **partner** that forms a compound with it, or type the **full compound**.
3. Find as many valid matches as you can for that prompt. **Hint** reveals a letter pattern for an unfound partner; **Skip** shows unfound answers and moves on; **New word** picks another prompt.

## Features

- Score, round, found count, and remaining matches
- Guesses accepted as partner only or full compound (case-insensitive)
- Shuffled match order each round
- Fully static assets (HTML, CSS, JS, JSON)

## Running locally

The game uses `fetch()` to load `compounds-clean-edited.json`, so open it through a **local HTTP server** (opening `index.html` directly from disk may fail in some browsers).

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Any static file server works (for example `npx serve`).

## Deployment

Host the static files on GitHub Pages, Netlify, Vercel, or any static host. Ensure `compounds-clean-edited.json` is deployed alongside `index.html`, `style.css`, and `script.js`.

## Project structure

| Path | Purpose |
|------|--------|
| `index.html` | Page markup |
| `style.css` | Layout and styling |
| `script.js` | Game logic and UI |
| `compounds-clean-edited.json` | Playable compound data (`base` + `matches` with `partner` / `compound`) |
| `make_compounds.py` | Build `compounds-clean.json` from a word list + noun filter |
| `build_noun_set.py` | Build `noun_words.json` from NLTK WordNet |
| `inspect_compounds.py` | CLI to list matches for a given base in `compounds-clean.json` |
| `remove_base_words.py` | Filter out selected bases; writes `compounds-clean-edited.json` |
| `remove_partner_matches.py` | Remove specific base/partner pairs; writes `compounds-clean-edited.json` |
| `requirements.txt` | Python dependency (`nltk`) |
| `.github/ISSUE_TEMPLATE/` | GitHub issue templates |

## Regenerating or editing the dataset (optional)

These steps are for **maintainers** who want to rebuild or curate data. Playing the game only requires the four static files above.

1. **Python 3** and dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. **Noun list** (WordNet via NLTK):

   ```bash
   python build_noun_set.py
   ```

   Produces `noun_words.json` (WordNet is downloaded on first run if needed).

3. **Compound candidates** require a `wordlist.txt` (one word per line, lowercase letters). That file is **not** tracked in this repository; supply your own list under that name next to `make_compounds.py`, then run:

   ```bash
   python make_compounds.py
   ```

   Output: `compounds-clean.json`.

4. **Inspect** a base word:

   ```bash
   python inspect_compounds.py apple
   ```

5. **Curate** for gameplay: adjust `remove_base_words.py` or `remove_partner_matches.py` (or edit JSON by hand), then run the script you need. Both read `compounds-clean.json` and write `compounds-clean-edited.json`, which is what the front end loads.

## Future ideas

- Daily puzzle, difficulty tiers, timer, leaderboards, mobile polish

## License

MIT License
