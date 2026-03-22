# Fly Laura, Fly!

Laura-themed Flappy Bird clone based on the upstream project at `jxmked/Flappybird`.

The playable static build lives at the repo root for GitHub Pages.
The editable source project lives in [source](/home/ubuntu/repos/l_birthday/source).

## What changed

- kept the upstream Flappy Bird gameplay
- replaced the stock bird frames with a Laura-inspired flying face sprite
- adjusted the app metadata and GitHub Pages path for this repository

## Local workflow

Install the upstream dependencies:

```bash
npm run install:source
```

Rebuild the site from source and sync the compiled output to the repo root:

```bash
npm run build
```

Preview the static site:

```bash
npm run preview
```

Then open `http://localhost:4173`.

## GitHub Pages

This repo is set up to publish the built static files from the root folder.

If you rebuild locally, commit the updated root files and push them:

```bash
git add .
git commit -m "Update Laura Flappy"
git push
```

For a reminder of the Pages steps:

```bash
npm run deploy:help
```
