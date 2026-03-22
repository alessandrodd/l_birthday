# Birthday Quest

Mobile-first HTML5 birthday game built as a static site for GitHub Pages.

## What is included

- `index.html`: page shell
- `styles.css`: responsive layout and visual styling
- `game.js`: full game logic in plain JavaScript

## Game flow

1. Cinema challenge: collect tickets, avoid projector beams
2. Music challenge: tap in time when notes cross the spotlight
3. Book challenge: match the memory cards
4. Frankfurt Flight: flappy-style finale with ECB-inspired buildings and euro coins
5. Final screen: reveals the password for the gift

## Quick customization

Edit the `CONFIG` object at the top of [game.js](/home/ubuntu/repos/l_birthday/game.js):

- `recipientName`
- `secretPassword`
- `finaleMessage`
- `voucherHint`

## Local preview

Run a simple static server from the repo root:

```bash
npm run preview
```

Then open `http://localhost:4173`.

If you prefer, you can also run:

```bash
bash scripts/preview.sh
```

## GitHub Pages

Push these files to a GitHub repository and enable GitHub Pages from the repository root.

Because this is a plain static site, no build step is required.

For a reminder of the exact steps:

```bash
npm run deploy:help
```
