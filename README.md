# NitroBolt Extension Packs

Hosted compatibility metadata for extension galleries that do not publish a
NitroBolt-compatible `pack.json` themselves.

Each creator has a directory in `packs/` containing:

- `builder.js` — fetches or maps the creator's upstream gallery metadata.
- `pack.json` — generated output served by the website. Do not edit it manually.

Run `pnpm build:packs` to refresh every generated pack and the website index.
Run `pnpm start` to build the packs and start the local site.
