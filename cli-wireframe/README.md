# cli-wireframe

CJK/emoji-safe ASCII/Unicode wireframe rendering with correct terminal display-width alignment.

## What It Does

Generates perfectly aligned terminal wireframes (boxes, tables, trees) even with Chinese/Japanese/Korean characters and emojis. Solves the common problem where `.length` miscounts display width, causing misaligned borders.

### The Problem

When AI generates ASCII boxes with CJK characters using naive `.length`:

```
// "Hello".length = 5, "你好".length = 2
// But in terminal: "Hello" = 5 columns, "你好" = 4 columns (each CJK = 2 wide)

+----------------+
| Hello          |
| 你好           |   ← AI added wrong padding, border breaks in terminal
+----------------+
```

### The Solution

This skill uses `string-width` to calculate actual display width:

```
+----------+
| Hello    |
| 你好     |   ← correct padding, perfectly aligned in terminal
+----------+
```

> **Note**: GitHub's code font doesn't render CJK at double-width, so the examples above may look odd here. In a real terminal with a monospace font, the borders align perfectly.

---

## Install for Claude Code

Copy/paste this into Claude Code:

```text
请帮我安装一个 Claude Code skill：

1. git clone https://github.com/catoncat/skills-repo.git /tmp/skills-repo
2. mkdir -p ~/.claude/skills
3. cp -r /tmp/skills-repo/cli-wireframe ~/.claude/skills/
4. cd ~/.claude/skills/cli-wireframe && bun install
5. rm -rf /tmp/skills-repo

完成后确认 ~/.claude/skills/cli-wireframe/SKILL.md 存在，告诉我重启 Claude Code。
```

---

## Install for Codex CLI

Copy/paste this into Codex:

```text
Install the Codex skill from:
- repo: catoncat/skills-repo
- path: cli-wireframe
into my $CODEX_HOME/skills folder.

Use the built-in skill-installer, then tell me to restart Codex.
```

---

## Manual Install

```bash
# For Claude Code
git clone https://github.com/catoncat/skills-repo.git
mkdir -p ~/.claude/skills
cp -r skills-repo/cli-wireframe ~/.claude/skills/
cd ~/.claude/skills/cli-wireframe && bun install

# For Codex CLI
git clone https://github.com/catoncat/skills-repo.git
mkdir -p ~/.codex/skills
cp -r skills-repo/cli-wireframe ~/.codex/skills/
cd ~/.codex/skills/cli-wireframe && bun install
```

---

## Usage

Once installed, the AI will automatically use this skill when you ask for:
- Terminal/ASCII wireframes
- CJK/emoji alignment fixes in ASCII boxes/tables
- "字符画", "终端线框图", "ASCII box"

Example prompt:
> "Draw me an ASCII table showing user info with Chinese names"

---

## Technical Details

- Uses `string-width` library for accurate display-width calculation
- Supports: `box`, `table`, `hstack`, `vstack` layouts
- Runtime: Bun (Node.js compatible)

See [SKILL.md](./SKILL.md) for the full AI instruction spec.
