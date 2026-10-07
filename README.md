# ChromaType

> A static web app for browsing color palettes and previewing typography with your own bundled fonts.

ChromaType is a browser-only tool for designers and developers. It offers two independent workbenches: one for exploring and exporting color palettes, and one for previewing typography with fonts bundled directly into the build. Each workspace stands on its own — no backend, no accounts, no external font CDN required.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## Why ChromaType

Most palette tools stop at color, and most font preview tools ignore color entirely. ChromaType gives you two focused workspaces instead of one crowded page:

- **Palette workspace** — browse, filter, copy, and generate palettes.
- **Typography workspace** — preview fonts, adjust type settings, and check readability.
- **Bundled fonts** — add font files to `public/fonts/`, register them in a manifest, and they ship with the build.
- **Static by default** — deploys cleanly to GitHub Pages and Cloudflare Pages.
- **Local-first state** — favorites and preferences stay in the browser.
- **Accessibility aware** — WCAG contrast feedback in the typography workspace.

The two workspaces are intentionally decoupled. Palettes do not drive typography previews, and typography previews do not consume palettes. You use each one on its own terms.

## Features at a Glance

| Area | Highlights |
| --- | --- |
| Palettes | Curated grid, detail view, format switching, harmony schemes, variants, copy and export |
| Typography | Font picker, size / weight / line-height / letter-spacing controls, hierarchy preview |
| Fonts | Local font directory, manifest-driven, `@font-face` generation script |
| Color tools | Format conversion, gradient builder, contrast checker, palette generator |
| Export | CSS Variables, Tailwind config, JSON, PNG (palette), `@font-face` CSS (font) |
| Storage | `localStorage` favorites for palettes and fonts, import / export configuration |
| Deployment | GitHub Pages and Cloudflare Pages ready out of the box |

For the full feature list, priorities, and acceptance criteria, see the [Feature Design](https://github.com/modan-photo/chroma-type/wiki/Feature-Design) wiki page.

## Quick Start

### Requirements

- Node.js 18 or newer
- npm 9 or newer (pnpm and yarn also work)

### Install and run

```bash
git clone https://github.com/modan-photo/chroma-type.git
cd chroma-type
npm install
npm run dev
```

The dev server starts at <http://localhost:5173>.

### Build and preview

```bash
npm run build
npm run preview
```

## Project Structure

```text
chroma-type/
├── public/
│   └── fonts/                  # Bundled font files, one folder per family
│       └── inter/
│           ├── Inter-Regular.woff2
│           ├── Inter-SemiBold.woff2
│           └── LICENSE.txt
├── scripts/
│   └── generate-font-css.ts    # Builds @font-face rules from the manifest
├── src/
│   ├── components/             # Shared UI components
│   ├── data/
│   │   ├── fonts/
│   │   │   └── manifest.ts     # Font metadata registry
│   │   └── palettes/           # Seed palette data
│   ├── features/
│   │   ├── palette/            # Palette workspace (independent)
│   │   └── typography/         # Typography workspace (independent)
│   ├── hooks/                  # Reusable React hooks
│   ├── pages/                  # Route-level components
│   ├── state/                  # Zustand stores
│   ├── styles/
│   │   └── generated-fonts.css # Auto-generated, do not edit by hand
│   └── utils/                  # Color math, contrast, formatting helpers
├── index.html
├── vite.config.ts
└── package.json
```

## The Two Workspaces

ChromaType ships with two independent tools that live side by side.

### Palette workspace

Everything related to color lives here.

- Browse a curated grid of palettes.
- Open a palette to inspect every swatch.
- Switch between HEX, RGB, HSL, and OKLCH.
- Copy a single color or the entire palette.
- Generate harmony schemes: monochrome, analogous, complementary, split-complementary, triadic.
- Export palettes as CSS Variables, Tailwind config, JSON, or PNG.

### Typography workspace

Everything related to type lives here.

- Pick a font from the bundled manifest.
- Edit the preview text.
- Adjust size, weight, line height, and letter spacing.
- Preview hierarchy levels: H1, H2, H3, Body, Caption.
- Toggle light and dark preview backgrounds.
- Read live WCAG contrast feedback for the current text and background pairing.
- Copy the font's `@font-face` CSS.

The two workspaces share the design system and the app shell, but they do not feed into one another.

## Adding Your Own Fonts

ChromaType treats fonts as first-class static assets. To add a font:

1. **Drop the files into `public/fonts/`**

    ```bash
    mkdir -p public/fonts/my-font
    cp MyFont-Regular.woff2 public/fonts/my-font/
    cp MyFont-SemiBold.woff2 public/fonts/my-font/
    cp MyFont-LICENSE.txt public/fonts/my-font/LICENSE.txt
    ```

    Always include the license file. ChromaType only ships fonts that permit redistribution.

2. **Register the font in the manifest**

    Edit `src/data/fonts/manifest.ts`:

    ```ts
    export const fonts = [
      {
        id: 'my-font',
        family: 'My Font',
        displayName: 'My Font',
        files: [
          { weight: 400, style: 'normal', path: '/fonts/my-font/MyFont-Regular.woff2' },
          { weight: 600, style: 'normal', path: '/fonts/my-font/MyFont-SemiBold.woff2' },
        ],
        license: 'SIL Open Font License 1.1',
        tags: ['sans-serif', 'ui'],
      },
    ]
    ```

3. **Regenerate the font CSS**

    ```bash
    npm run font:css
    ```

    This writes `src/styles/generated-fonts.css` from the manifest. The file is imported once in the app entry point, so new fonts become available immediately in the typography workspace.

4. **Rebuild**

    ```bash
    npm run build
    ```

Font files are copied from `public/fonts/` into `dist/fonts/`, so they deploy alongside the rest of the site.

> Prefer `woff2` for the smallest payload. Variable fonts are supported — declare a weight range in the manifest.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run font:css` | Regenerate `@font-face` rules from the font manifest |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run deploy` | Publish to GitHub Pages |

## Deployment

ChromaType is a static site. Both GitHub Pages and Cloudflare Pages work without any server-side configuration.

### GitHub Pages

```bash
npm run build
npm run deploy
```

Set `base` in `vite.config.ts` if the repository is served from a subpath, and confirm the `homepage` field in `package.json`.

### Cloudflare Pages

Connect the repository in the Cloudflare dashboard and use:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Fonts under `public/fonts/` are copied into `dist/fonts/` during the build, so they are served from the same origin as the app.

> If you use React Router, prefer `HashRouter` on GitHub Pages, or add an SPA fallback rule on Cloudflare Pages.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React + TypeScript |
| Build | Vite |
| Routing | React Router (`HashRouter` for GitHub Pages) |
| Styling | Tailwind CSS + CSS Variables |
| State | Zustand with `persist` |
| Color math | colorjs.io |
| Fonts | Local `@font-face`, optional Fontsource |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions |

## Roadmap

- **v0.1** — palette grid and detail, typography preview, local font pipeline, favorites, dual deployment.
- **v0.2** — search and filtering, color tools, CSS / JSON / PNG export, dark mode.
- **v0.3** — image color picking, OKLCH palette generator, font subsetting, PWA.
- **v1.0** — stable data formats, accessibility audit, full documentation.

See the [Roadmap](https://github.com/modan-photo/chroma-type/wiki/Roadmap) wiki page for details.

## Documentation

Comprehensive documentation lives in the [project wiki](https://github.com/modan-photo/chroma-type/wiki):

- [Product Requirements](https://github.com/modan-photo/chroma-type/wiki/Product-Requirements)
- [Feature Design](https://github.com/modan-photo/chroma-type/wiki/Feature-Design)

## License

Released under the [MIT License](./LICENSE).

Bundled fonts are distributed under their own licenses. See the `LICENSE.txt` file inside each font folder under `public/fonts/`.
