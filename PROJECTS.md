# DOKUNTAG Project Registry

Status: Active
Owner: Product Owner
Updated: 2026-10-03

This registry tells a fresh chat where to recover active DOKUNTAG project context. It is a routing index, not a substitute for each project's own rules or current-state file.

## Active focus set

### Agent OS
- Canonical local repo: `C:\Users\user\dokuntag\agent-os`
- Current-state authority: `CURRENT_STATE.md`
- Queue: `BACKLOG.md`
- Startup authority: `AGENTS.md`
- Resume example: "Agent OS'a devam edelim."
- General-scan role: active engineering/owner-assistant platform work.

### DOKUNTAG Studio
- Canonical local repo: `C:\Users\user\dokuntag\repositories\dkntg-studio`
- Current-state recovery: `AGENTS.md`, `README.md`, `BACKLOG.md`, and current Git working-tree/branch state.
- Queue: `BACKLOG.md`
- Resume example: "Studio'da devam edelim."
- Note: when the repository reaches a safe clean checkpoint, prefer adding one concise dedicated current-state authority instead of relying on broad docs indefinitely.
- General-scan role: active social/creator operations and Studio product work.

### DOKUNTAG Apps
- Canonical local repo: `C:\Users\user\dokuntag\repositories\dokuntag-apps`
- Portfolio current-state authority: `docs\PORTFOLIO-STATUS.md`
- App-specific state: `docs\apps\<app>\STATUS.md` or declared app handoff/release brief.
- Queue: `BACKLOG.md`
- Startup authority: `AGENTS.md` and `docs\START-HERE.md`
- Resume examples: "Apps'e devam edelim." / "Random'a devam edelim."
- General-scan role: active app portfolio, aftercare, store/release waiting states.

### DOKUNTAG Publish
- Canonical GitHub project: `idemfb/dokuntag-publish`
- Canonical local repository family: `C:\Users\user\dokuntag\repositories\dokuntag-publish`
- Worktree selection: resolve through Git reconciliation; do not assume a legacy `publishPack` folder is the current source.
- Current-state recovery in the selected safe worktree: `PROJECT_STATUS.md`, `docs\HANDOFF.md`, project rules, and `BACKLOG.md`.
- Queue: root `BACKLOG.md` in the selected active/safe worktree.
- Resume example: "Publish'e devam edelim."
- General-scan role: active Hub/Publish/search/SEO/content work.

## Shared operations
- Repo: `C:\Users\user\dokuntag\repositories\dokuntag`
- Purpose: cross-product runbooks, work-queue standard, continuity standard, project registry, workspace Inbox, safe helpers.
- This is not a product implementation repo.

## Other repositories

Other repositories under `C:\Users\user\dokuntag\repositories` remain addressable projects but are not automatically included in the normal daily focus scan unless:
- the Product Owner names them;
- an active blocker/radar item makes them relevant;
- their own current-state record marks them active.

For a newly active repository, add it here only after identifying its canonical path and current-state authority.

## General scan rule

For "Bugün DOKUNTAG için nereden başlayalım?" or equivalent:
1. inspect the active focus set only;
2. read each project's smallest current-state authority and backlog;
3. check Git sync/dirty/blocker state;
4. identify waiting external dependencies;
5. return a concise set of sensible choices without automatically starting mutations.

Do not rank projects from stale chat memory when durable project evidence is available.
