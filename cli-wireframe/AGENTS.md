# Repository Guidelines

## Project Structure & Module Organization

- `scripts/` — runnable utilities (main entry: `scripts/render-wireframe.mjs`).
- `references/` — example input specs (e.g. `references/demo-spec.json`).
- `SKILL.md` — user-facing usage and spec shape; update when behavior changes.
- `package.json` / `bun.lock` — dependencies and lockfile for Bun.
- Generated: `node_modules/` (don’t commit).

## Build, Test, and Development Commands

- `bun install` — install dependencies.
- `bun scripts/render-wireframe.mjs --demo all --markdown` — render all built-in demos as a Markdown code fence.
- `bun scripts/render-wireframe.mjs --spec references/demo-spec.json --markdown` — render from a JSON spec file.
- `cat spec.json | bun scripts/render-wireframe.mjs --markdown` — render a JSON spec from stdin.

## Coding Style & Naming Conventions

- JavaScript is ESM (`"type": "module"`). Match existing style: tabs for indentation, double quotes, semicolons, and trailing commas.
- Alignment is display-width based: never use `.length` for layout; always use `string-width` via the `dw()` helper and keep truncation/padding width-aware.
- Prefer small pure helpers (`cell`, `truncateToWidth`, `padRightToWidth`) and keep spec fields stable (`type`, `width`, `title`, `lines`, `columns`, `rows`).

## Testing Guidelines

- There is no formal test runner yet; validate changes by running the demos and visually checking right borders with mixed CJK and emoji.
- If you add tests, keep them deterministic (snapshot-style text output comparisons are preferred).

## Commit & Pull Request Guidelines

- This directory may be vendored into a larger repo; follow the parent project’s conventions when available. Otherwise use Conventional Commits (e.g. `feat:`, `fix:`, `docs:`, `chore:`).
- PRs should include: a short description, the exact command used to reproduce, and rendered output in a Markdown code fence. For alignment issues, include terminal + font details.
