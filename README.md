# Skills Repo

A collection of AI coding agent skills for **Claude Code** and **Codex CLI**.

## Available Skills

| Skill | Description |
|-------|-------------|
| [cli-wireframe](./cli-wireframe/) | CJK/emoji-safe ASCII wireframe rendering with correct terminal display-width alignment |

> More skills coming soon...

---

## How to Install

Each skill has its own README with copy-paste installation instructions. Click on a skill above to see details.

### Quick Install Pattern

**For Claude Code** — paste this template (replace `<skill-name>`):

```text
请帮我安装一个 Claude Code skill：

1. git clone https://github.com/catoncat/skills-repo.git /tmp/skills-repo
2. mkdir -p ~/.claude/skills
3. cp -r /tmp/skills-repo/<skill-name> ~/.claude/skills/
4. cd ~/.claude/skills/<skill-name> && bun install
5. rm -rf /tmp/skills-repo

完成后告诉我重启 Claude Code。
```

**For Codex CLI** — paste this template (replace `<skill-name>`):

```text
Install the Codex skill from:
- repo: catoncat/skills-repo
- path: <skill-name>
into my $CODEX_HOME/skills folder.

Use the built-in skill-installer, then tell me to restart Codex.
```

---

## Contributing

Want to add a new skill? Each skill should have:

```
your-skill/
├── README.md      # Installation instructions + usage
├── SKILL.md       # AI instructions (YAML frontmatter + Markdown)
├── AGENTS.md      # Development guidelines (optional)
├── scripts/       # Executable scripts (if needed)
└── references/    # Example files (if needed)
```

See [cli-wireframe](./cli-wireframe/) as a reference implementation.
