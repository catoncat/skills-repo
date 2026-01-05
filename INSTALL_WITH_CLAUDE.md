# Install with Claude Code

Copy/paste the block below into Claude Code. It will install this repo's `cli-wireframe` skill into your local skills folder.

```text
请帮我安装一个 Claude Code skill：

1. 克隆仓库：git clone https://github.com/catoncat/skills-repo.git /tmp/skills-repo
2. 创建 skills 目录：mkdir -p ~/.claude/skills
3. 复制 skill：cp -r /tmp/skills-repo/cli-wireframe ~/.claude/skills/
4. 安装依赖：cd ~/.claude/skills/cli-wireframe && bun install
5. 清理临时文件：rm -rf /tmp/skills-repo

完成后确认 ~/.claude/skills/cli-wireframe/SKILL.md 存在，并告诉我重启 Claude Code 以加载新 skill。
```

---

Or in English:

```text
Please install a Claude Code skill for me:

1. Clone the repo: git clone https://github.com/catoncat/skills-repo.git /tmp/skills-repo
2. Create skills directory: mkdir -p ~/.claude/skills
3. Copy the skill: cp -r /tmp/skills-repo/cli-wireframe ~/.claude/skills/
4. Install dependencies: cd ~/.claude/skills/cli-wireframe && bun install
5. Clean up temp files: rm -rf /tmp/skills-repo

After installation, confirm that ~/.claude/skills/cli-wireframe/SKILL.md exists, then tell me to restart Claude Code to load the new skill.
```
