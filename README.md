# skills-repo

This repo contains installable Codex skills.

## Skills

- `cli-wireframe/` — CJK/emoji-safe ASCII/Unicode wireframe rendering (boxes/tables/trees) with correct terminal display-width alignment.

## Install (Recommended: via Codex)

Codex ships a built-in system skill **skill-installer** that can install skills directly from GitHub.

Copy/paste this into Codex:

```text
Install the Codex skill from:
- repo: catoncat/skills-repo
- path: cli-wireframe
into my $CODEX_HOME/skills folder (default ~/.codex/skills).

Use the built-in skill-installer to do it, then tell me to restart Codex.
```

## Install (Terminal / Script)

If you prefer a direct command, run:

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo catoncat/skills-repo \
  --path cli-wireframe
```

Then restart Codex to pick up the new skill.

## Manual Install

```bash
git clone https://github.com/catoncat/skills-repo.git
mkdir -p ~/.codex/skills
rsync -a --exclude node_modules skills-repo/cli-wireframe/ ~/.codex/skills/cli-wireframe/
```

