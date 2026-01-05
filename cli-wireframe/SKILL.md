---
name: cli-wireframe
description: Repair CJK/emoji display-width alignment in monospaced ASCII/Unicode wireframes (e.g., +---+ borders, terminal/ASCII UI mockups) using `string-width`. Use only when the user requests/provides ASCII/terminal wireframes or asks to fix misaligned borders; not for Markdown tables or general charts. Never mention the tool/skill in the user-facing output.
---

# Cli Wireframe

## When To Use

- User asks for a terminal/ASCII wireframe: “字符画/终端线框图/ASCII box/table/TUI mock”.
- User asks to fix alignment: “边框不齐/字宽对齐/CJK/emoji 对齐问题” for an ASCII/Unicode box/table/tree.

Never introduce ASCII wireframes unless the user explicitly asks for them (or provides one to fix). If the user just wants a normal table/chart in an explanation, use Markdown tables or prose.

## Output Rules (Important)

- Treat this skill as a **component generator**, not a full-response replacement.
- Never include meta narration like “我用 cli-wireframe/bun 生成了…”. Just present the content.
- If you need a lead-in line, use neutral phrasing like “下面是一个表格/示意图：”.
- Embed rendered wireframes in Markdown as ` ```text ... ``` ` blocks, then continue with normal paragraphs.

## Efficiency (Keep It Fast)

- Prefer **one** render call per answer: combine multiple blocks with `vstack`/`hstack` and render once.
- Skip `update_plan` unless the user explicitly asks for a plan or the task is genuinely multi-step.
- Don’t run environment checks (e.g. `bun --version`) unless something fails.
- Don’t open/read `scripts/render-wireframe.mjs` unless you are modifying it; treat it as a black box renderer.

## Quick Start

If dependencies are missing, run:

```bash
bun install
```

Render built-in demos:

```bash
bun scripts/render-wireframe.mjs --demo all --markdown
```

Render from a JSON spec:

```bash
bun scripts/render-wireframe.mjs --spec references/demo-spec.json --markdown
```

Or pipe a spec via stdin:

```bash
cat <<'JSON' | bun scripts/render-wireframe.mjs --markdown
{ "type": "box", "width": 34, "title": "标题 / Title", "lines": ["你好 Hello", "右边界对齐 OK"] }
JSON
```

## Guardrails (Do Not Skip)

- Never use `.length` for alignment; always use display width (`string-width`).
- All padding must be computed from display-width differences.
- If emoji alignment differs on a user’s terminal/font, remove emoji from the wireframe (CJK alignment remains correct).

## Spec Shape (Minimal)

Top-level object with `type` in: `box`, `table`, `hstack`, `vstack`.

- `box`: `{ type, width?, title?, lines[] }` (`width` omitted = auto-fit, avoids truncation)
- `table`: `{ type, width?, title?, columns[], rows[] }` (`width` omitted = auto-fit, avoids truncation)
  - `columns[]`: `{ key, header?, width?, minWidth?, maxWidth?, align?: left|right|center }`
  - If `columns[].width` is omitted, column widths are inferred from content.
- `hstack`/`vstack`: `{ type, gap?, children[] }`
