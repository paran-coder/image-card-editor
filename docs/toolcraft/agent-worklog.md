# Implementation Worklog

This file records product decisions and the evidence behind them.

## Status

Mode: product

Image Card Editor is a Toolcraft product app for composing an uploaded image into a clean SNS-style card with adjustable format, background, image placement, text styling, and PNG export.

## Verification Tier

- Verification tier: Tier 4
- Reason: This pass turns a fresh generated starter into the first working product version with schema controls, custom canvasContent renderer, media flow, PNG export, acceptance metadata, performance matrix, and worklog updates.
- Run: `pnpm build`; attempt `pnpm verify:quick` if build is clean.
- Skip: Full browser performance checkpoint is noted as required for final product delivery, but this user specifically requested `pnpm build` as the final command for the implementation prompt.

## Decision Trail

### Iteration 1 - Image Card Editor

- Request: Build an image card editor where users upload an image, tune card ratio, background color, image scale/position, radius, depth, title text/style, caption text/style, and export a clean SNS card.
- Task type: Generated Toolcraft product app with schema controls, media import, DOM preview renderer, PNG export, acceptance, and performance metadata.
- User-visible result: The app shows a Toolcraft canvas with a centered card preview, right-panel controls for source image and card settings, and an Export PNG footer action.
- Source/reference checked: Local Toolcraft `AGENTS.md`, workflow, schema reference, component rules, acceptance testing, renderer technique, performance docs, existing runtime hooks, and export helpers.
- Reference inputs: None.
- Docs/contracts read: `AGENTS.md`; `docs/toolcraft/workflow.md`; `docs/toolcraft/schema-reference.md`; `docs/toolcraft/component-rules.md`; `docs/toolcraft/acceptance-testing.md`; `docs/toolcraft/renderer-technique.md`; `docs/toolcraft/performance.md`.
- Contract rules applied: Use `defineToolcraft` and `ToolcraftApp`; keep controls schema-owned; keep product output in `canvasContent`; use `fileDrop` for image source; keep layers and timeline disabled for a single static card; expose `Background` directly before `Image Export`; use standard PNG export helper; record section inventory and product readiness.
- Decision: Implement the preview as a DOM/CSS `canvasContent` renderer, use `fontPicker` for title/caption style, use `fileDrop` for source media, use `vector` for image position, and export PNG through `createToolcraftPngExportCanvas`.
- Alternatives rejected: Canvas 2D live preview was rejected because native DOM text is crisper and simpler for two text blocks; WebGL/WebGPU were rejected because one uploaded image and low-count text/composite layers do not need GPU shaders; Layers were rejected because the app has one composed product card rather than multiple editable objects; Timeline was rejected because there is no animation or video export.
- State/output mapping: `source.image` imports runtime media; optional `font.embed` imports a persisted runtime file media asset used as the title/caption font; runtime `canvas.size` defines the final card format; `card.radius`, `card.shadow`, `image.scale`, `image.position`, `title.text`, `title.style`, `caption.text`, `caption.style`, `export.includeBackground`, and `appearance.background` are read by `ImageCardRenderer`; export settings feed `handleImageCardPanelAction`, which draws the same state to a PNG canvas.
- Files changed: `src/app/app-schema.ts`; `src/app/2026-07-02-image-card-renderer.tsx`; `src/routes/index.tsx`; `src/app/app-acceptance.ts`; `src/app/app-performance.ts`; `src/app/app-schema.test.ts`; `docs/toolcraft/agent-worklog.md`.
- Verification: `pnpm build` passed. `pnpm verify:quick` is blocked by missing required AI workflow skills in this environment. Direct `pnpm test` passed docs, integrity, and script tests, then exposed unimplemented full browser/performance fallback coverage beyond the user-requested build gate.
- Skipped checks: Browser acceptance and full browser performance checkpoint are pending; user-requested final command was `pnpm build`.
- Risks: Export text layout uses Canvas 2D approximations, so exact line wrapping can differ slightly from DOM preview for unusual fonts or very long text. Full Toolcraft acceptance/performance automation still needs browser test authoring if this app is promoted to final delivery quality.

## Decisions

### Renderer

- Decision: DOM/CSS preview renderer with Canvas 2D PNG export.
- Reason: The product output is one bitmap image, two native text blocks, background fill, radius, and depth/lift treatment. DOM preserves live text fidelity and CSS transforms keep controls responsive.
- Evidence: `src/app/2026-07-02-image-card-renderer.tsx` renders `[data-product-output='image-card']` in `canvasContent`; `src/app/app-performance.ts` declares DOM preview and Canvas 2D export technique.

### Timeline

- Decision: No timeline.
- Reason: The requested product is a still SNS card editor with PNG export and no animation or video export.
- Evidence: `appTransferMode.animationIntent.mode` is `none`; `appSchema.panels.timeline` is omitted.

### Layers

- Decision: No Layers panel.
- Reason: The app composes one output card and does not offer multiple editable/reorderable objects.
- Evidence: `appSchema.panels.layers` is omitted; image, title, and caption are fixed product regions controlled from the schema.

### Controls

- Decision: Use built-in `fileDrop`, `segmented`, `slider`, `vector`, `text`, `fontPicker`, `switch`, `color`, `select`, and `panelActions`.
- Reason: These built-ins directly match the requested value models and preserve runtime layout, reset, persistence, and acceptance behavior.
- Evidence: `src/app/app-schema.ts` declares every requested editable value; `starterControlSectionInventory` maps every product target to its semantic section.

### Export

- Decision: Still product exposes `Export PNG`, with required `Background` and `Image Export` sections.
- Reason: The requested deliverable is a static image card, so PNG export is the required delivery path.
- Evidence: `src/app/app-schema.ts` includes `export.includeBackground`, `appearance.background`, `export.image.format`, `export.image.resolution`, and `export.actions`; renderer code calls `createToolcraftPngExportCanvas` with runtime background and resolution.

### Performance

- Decision: Treat media import, image scale dragging, and 8K PNG export as workload scenarios; treat other controls as responsiveness work.
- Reason: Preview is low-primitive DOM composition, but source media size and export resolution can change workload materially.
- Evidence: `src/app/app-performance.ts` declares 3840x2160 media import, max scale drag, and 8K PNG export scenarios with fully guaranteed load profiles.

## Evidence

- Source reviewed: local Toolcraft contracts and runtime files in this app folder.
- Contract applied: product apps require schema-owned controls, `canvasContent` product renderer, background/export sections, acceptance rows, performance metadata, and product worklog.

## Verification

- Run: `pnpm build` passed.
- Run: `pnpm verify:quick` failed at `pnpm ai:check` because required workflow skills are missing: brainstorming, writing-plans, systematic-debugging, figma, and figma-implement-design.
- Run: `pnpm test` passed local docs, integrity, and script tests; Vitest then reported missing app-specific browser/performance fallback coverage.
- Required later for full first working product delivery: browser acceptance and browser performance checkpoint with agent-browser or Playwright fallback.

## Risks

- Risk: Browser acceptance/performance tests may need selector-specific refinements after the first automated run because this is the initial product conversion from the starter.
