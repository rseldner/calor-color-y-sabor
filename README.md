# Recipe Box

A drop-in recipe page: add a markdown file to `/recipes`, it becomes a searchable
card on the homepage and its own shareable page. Built with [Eleventy](https://www.11ty.dev/),
deployed to GitHub Pages.

## Add a recipe

Create a new file in `/recipes/your-recipe-name.md`:

```markdown
---
layout: recipe.njk
title: Your Recipe Name
category: mains          # mains | soups | baking | sides (or add your own — see below)
time: 30 min
serves: 4
blurb: One sentence that shows up on the card.
tags: [weeknight, vegetarian]
ingredients: |
  First ingredient
  Second ingredient
permalink: "recipes/{{ title | slug }}/"
---
1. First step.
2. Second step.
3. Third step.
```

The numbered list in the body becomes the "Method" section. That's the whole workflow —
no other file needs to change.

### Ingredients

`ingredients` is a plain block of text — one ingredient per line, no dashes, no quoting.
Paste a list straight from anywhere and drop it in. Use `**bold**` on a line by itself to
group ingredients into labeled subsections:

```yaml
ingredients: |
  **Marinade:**
  2 tbsp soy sauce
  1 tbsp rice vinegar
  **For serving:**
  Steamed rice
  Scallions
```

Bold group labels render as `<strong>` on the recipe page.

### Adding a new category

Categories aren't hardcoded. Use any value for `category` and it'll show up as a filter
automatically. To give a new category its own tab color, add a rule to `assets/style.css`:

```css
.tab--yourcategory { background: #yourcolor; }
```

If you skip this, new categories fall back to a neutral tab color.

## Local development

```bash
npm install
npm run serve   # local server with live reload at localhost:8080
npm run build    # one-off build to /_site
```

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes it to GitHub Pages. One-time setup in your repo:

1. Push this project to a GitHub repo.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` — the site builds and deploys automatically.

## How search works

At build time, `search-index.njk` writes a small JSON file (`/search-index.json`)
listing every recipe's title, category, blurb, and tags. In the browser,
`assets/search.js` loads that file and uses [Fuse.js](https://www.fusejs.io/) (loaded
from a CDN) for fuzzy client-side search — no server, no database, stays fast as the
collection grows.

## Project structure

```
recipes/                 ← drop markdown files here
_includes/
  base.njk                ← shared HTML shell
  recipe.njk               ← layout for individual recipe pages
index.njk                  ← homepage: grid, search bar, category filters
search-index.njk            ← generates /search-index.json at build time
assets/
  style.css                 ← all styling
  search.js                  ← client-side search/filter logic
utils/slugify.js              ← turns a title into a URL-safe slug
.github/workflows/deploy.yml   ← builds + publishes to GitHub Pages on push
```
