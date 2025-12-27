# Copilot instructions for ttrpg-inventory-manager

This repository is a single-file Vue 3 + Tailwind static app (see [index.html](index.html)). The guidance below focuses on facts discoverable in the code and actionable conventions for making changes.

- Big picture: This is a client-side UI mounted on `#app` using Vue 3 from CDN. UI, state, and logic all live in `index.html` (no build system). Tailwind and Lucide icons are included via CDN.

- Key data flows and boundaries:
  - `dbItems` (library) vs `inventory` (placed items). Library items are templates; inventory entries have `instanceId` and `position`.
  - Grid rendering is computed from `inventory` into `gridDisplay` (see `gridDisplay` computation in `index.html`).

- Important helpers to reuse / follow:
  - Slot calculation: `calculateCost` determines `slotCost` from weight. Reference: [index.html](index.html#L364).
  - Placement rules: `canPlaceItem(startIndex, item, excludeInstanceId)` implements collision checks and small-item stacking (up to 3 small items per cell). Reference: [index.html](index.html#L464).
  - Drag payloads: new items from the library use `{ source: 'library', itemId }`, existing items use `{ source: 'grid', instanceId }`. Drag handlers are attached on library and grid items (see drag attributes around [index.html](index.html#L165) and [index.html](index.html#L302)).

- Integration points and I/O:
  - Share/load via URL: `copyShareLink()` encodes strength + inventory into a `loadout` query param (base64). Reference: [index.html](index.html#L612).
  - Import 5e.tools JSON: `import5eData(event)` reads a user-supplied JSON file and merges new item defs into `dbItems`. Reference: [index.html](index.html#L682).

- Conventions and patterns in this project:
  - No module bundler: edit `index.html` directly. Keep helper functions near the top of the `<script>` block for discoverability.
  - Small items: `slotCost === 1` are treated as stackable containers; other costs occupy multiple grid slots (slot footprint is `slotCost / 3`). See placement logic at [index.html](index.html#L406-L412) and placement checks at [index.html](index.html#L464).
  - Visual classes and themes are defined inline in the `<style>` block near the top of the file—follow existing naming (e.g., `locked-pattern`, `drag-valid`, `drag-invalid`) when adding styles.

 - Developer workflows (what works now):
   - Local run: there is no build step — open `index.html` in a browser or run a static server from the project root:

     python3 -m http.server 8000

   - Branching & commits: never commit directly to `main`. Create a feature branch named using the pattern `feature/`, `chore/` or `fix/` (e.g. `feature/add-importer`, `fix/collision-check`). Make small, working commits that each represent a single logical change and use conventional prefixes in commit messages: `feature:`, `chore:`, `fix:`.

   - Pull requests: open a PR from your branch into `main`. Title and description should indicate type (Feature/Chore/Bugfix), summary, and any manual verification steps (e.g., which pages to open and which behaviors to test).

   - Testing before PR: run the full test suite when present. Currently there is no automated test runner in the repo; until tests are added, verify changes manually:

     - Start a local server and open `index.html`.
     - Test drag/drop for library → grid and grid → grid moves.
     - Test `Import 5e.tools JSON` flow with a small sample JSON.
     - Test `Share Scroll` to confirm `loadout` param round-trips via URL.

    - Important: Do NOT run `npm run dev` or `npm test` in watch mode. Run tests as a single-pass test command (for example, `npm test -- --run` when using Vitest).

   - CI / adding tests: if you add CI workflows, ensure they run the repo's test command (if you add tests, include a top-level `make test`, `npm test`, or `pytest` step) and fail fast on lint/test failures.

   - PR classification: mark PRs clearly as Feature/Chore/Bugfix in the title and use focused commits so reviewers can inspect incremental work easily.

- Suggested safe edits and where to be careful:
  - When changing `calculateCost` or `canPlaceItem`, update all call sites (slot assignment when importing items and placement checks during drag/drop).
  - Changing the grid size/indices requires adjusting all loops that assume 20 slots (search for `20` in `index.html`).
  - The share/load URL format is compact (base64). Avoid changing that format unless you update `loadFromUrl()` and any external links that rely on it.

- Useful spots to inspect before edits:
  - Library UI and drag sources: [index.html](index.html#L140-L175)
  - Grid cell rendering and drag/drop receivers: [index.html](index.html#L276-L330)
  - Core helpers and placement rules: [index.html](index.html#L364-L476)
  - Import & share functions: [index.html](index.html#L612-L700)

If anything above is unclear or you want more detail (unit-tests, split into modules, or CI actions), tell me which area to expand and I'll revise this file.
