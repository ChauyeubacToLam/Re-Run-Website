# RE:RUN Website

Standalone copy of the RE:RUN modular sneaker concept website, including all client code, images, fonts, video and mirrored dependencies. The original comparison workspace is not required to run this repository.

## Deploy on Vercel

1. Import `ChauyeubacToLam/Re-Run-Website` into Vercel.
2. Keep **Root Directory** at the repository root.
3. Framework: **Other**. Build command: **npm run build**. Output directory: **public**.
4. Deploy. No environment variables or application dependencies are required.

These settings are provided in `vercel.json`. The MIME headers also cover the clone's extensionless JSON, JavaScript, CSS, font and HTML endpoints, including the product data used by the existing color selector. See [Vercel configuration documentation](https://vercel.com/docs/project-configuration/vercel-json).

## Local preview

```sh
npm run build
npm start
```

Open http://127.0.0.1:3000. Use `node scripts/serve.mjs 3001` to select another port. Serve `public` as the website root; do not open `index.html` directly from the filesystem.

## Files

- `public/index.html`: primary page.
- `public/assets/rerun/`: RE:RUN copy, images and gallery data adapter.
- `public/assets/rerun/v2/`: latest generated artwork and six colorways.
- `public/cdn/` and `public/_ext/`: copied styles, scripts, fonts and mirrored dependencies.
- `scripts/source-manifest.json`: SHA-256 inventory of the 586 website files copied from the original workspace.

This is a visual concept site. Color/view selection and the page animations run locally; payments, accounts, the passport app, chatbot and the credit/repair/resale programs are not connected to RE:RUN backend services. Legacy store integration scripts remain in the mirrored source.
