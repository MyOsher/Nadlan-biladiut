# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## Project status: greenfield

As of the latest update, this repository is in its **initial/scaffolding
phase**. The only tracked file is `README.md`; there is no application code,
build configuration, dependency manifest, or test suite yet.

Because the codebase is empty, most of this document describes **conventions to
follow as code is added** rather than existing structure. **Keep this file
current**: whenever you introduce a stack, tooling, directory layout, or
workflow, update the relevant section below so it reflects reality. Do not
document things that don't exist — prefer an accurate "not set up yet" over an
aspirational description.

## What this project is

`Nadlan-biladiut` ("Nadlan" / נדל״ן is Hebrew for *real estate*) is, by name, a
real-estate / property application. The concrete domain model, features, and
architecture have not yet been committed. Confirm intent with the repository
owner before assuming specifics.

## Repository layout

```
.
├── README.md      # Project name / description (currently minimal)
└── CLAUDE.md      # This file
```

Update this tree as directories are added (e.g. `src/`, `app/`, `tests/`,
`supabase/`, etc.).

## Tooling available in the working environment

These integrations are wired into the development session and signal the likely
direction of the project. They are **session tooling**, not yet committed
project decisions — treat them as available capabilities, not as established
architecture, until corresponding config lands in the repo.

- **Supabase** (MCP): database / auth / edge-function backend. Inspect schema
  with `list_tables` before proposing changes; check `get_advisors` and
  `get_logs` when debugging. Apply schema changes via migrations, not ad-hoc
  SQL, once a `supabase/` directory exists.
- **Vercel** (MCP): deployment target for a web frontend.
- **GitHub** (MCP): all GitHub operations (PRs, issues, CI) go through the
  `mcp__github__*` tools — there is no `gh` CLI in this environment.

When you adopt any of these into the codebase, record the decision here along
with the relevant commands.

## Development workflow

### Branching

- All work happens on the designated feature branch:
  **`claude/claude-md-docs-MYWLA`** (create it locally if missing).
- **Never** push to `main` or any other branch without explicit permission.
- `main` is the integration branch; feature branches merge into it via PR.

### Commits

- Write clear, descriptive, imperative commit messages
  (e.g. "Add Supabase auth scaffolding").
- Commit logically scoped changes; keep the working tree clean.

### Pushing

- Push with `git push -u origin <branch-name>`.
- On network failure, retry up to 4 times with exponential backoff
  (2s, 4s, 8s, 16s).

### Pull requests

- **Do not open a PR unless explicitly asked.**
- Create PRs through the GitHub MCP tools, targeting `main`.

## Build, run, and test

No build system, run command, or test runner is configured yet.

➡️ **When you add one, document the exact commands here**, for example:

```
# install dependencies
<command>

# run the dev server
<command>

# run tests / linters
<command>
```

A CI-friendly setup (single command to install, lint, and test) is strongly
preferred so sessions can validate changes automatically.

## Conventions for AI assistants

- **Match the surrounding code** once it exists — naming, formatting, comment
  density, and idioms should follow established patterns rather than introducing
  new ones.
- **Don't fabricate.** If a fact (stack, command, structure) isn't in the repo,
  say so rather than inventing it.
- **Verify before destructive actions.** Inspect a file before overwriting or
  deleting it; surface surprises instead of plowing ahead.
- **Keep this file truthful.** Update it in the same change that alters the
  structure or workflow it describes.
