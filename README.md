# skills-repo

This repo contains installable skills for **Codex CLI** and **Claude Code**.

## Skills

- `cli-wireframe/` — CJK/emoji-safe ASCII/Unicode wireframe rendering (boxes/tables/trees) with correct terminal display-width alignment.

---

## Install for Claude Code

### Recommended: Paste into Claude Code

Copy/paste this into Claude Code:

```text
请帮我安装一个 Claude Code skill：

1. 克隆仓库：git clone https://github.com/catoncat/skills-repo.git /tmp/skills-repo
2. 创建 skills 目录：mkdir -p ~/.claude/skills
3. 复制 skill：cp -r /tmp/skills-repo/cli-wireframe ~/.claude/skills/
4. 安装依赖：cd ~/.claude/skills/cli-wireframe && bun install
5. 清理临时文件：rm -rf /tmp/skills-repo

完成后确认 ~/.claude/skills/cli-wireframe/SKILL.md 存在，并告诉我重启 Claude Code 以加载新 skill。
```

### Manual Install for Claude Code

```bash
git clone https://github.com/catoncat/skills-repo.git
mkdir -p ~/.claude/skills
rsync -a --exclude node_modules skills-repo/cli-wireframe/ ~/.claude/skills/cli-wireframe/
cd ~/.claude/skills/cli-wireframe && bun install
```

Then restart Claude Code to pick up the new skill.

---

## Install for Codex CLI

### Install (Recommended: via Codex)

Codex ships a built-in system skill **skill-installer** that can install skills directly from GitHub.

Copy/paste this into Codex:

```text
Install the Codex skill from:
- repo: catoncat/skills-repo
- path: cli-wireframe
into my $CODEX_HOME/skills folder (default ~/.codex/skills).

Use the built-in skill-installer to do it, then tell me to restart Codex.
```

### Install (Terminal / Script) for Codex

If you prefer a direct command, run:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo catoncat/skills-repo \
  --path cli-wireframe
```

Then restart Codex to pick up the new skill.

### Manual Install for Codex

```bash
git clone https://github.com/catoncat/skills-repo.git
mkdir -p ~/.codex/skills
rsync -a --exclude node_modules skills-repo/cli-wireframe/ ~/.codex/skills/cli-wireframe/
```

Then restart Codex to pick up the new skill.

