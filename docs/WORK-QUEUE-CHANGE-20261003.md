# Work Queue Governance Change — 2026-10-03

Status: Approved and implemented locally
Approving owner: Product Owner
Date: 2026-10-03

## Reason and cross-product value

DOKUNTAG now has several active products and repositories. Small, non-urgent improvements were interrupting focused work and could cause unnecessary build, CI, preview, or deploy cycles. The work-queue protocol creates one lightweight deferred-work mechanism per project while preserving urgent handling.

## Affected canonical documents

- `docs/WORK-QUEUE-STANDARD.md` in this shared operations repository
- workspace `AGENTS.md`
- workspace `AI-BOOTSTRAP.md`
- participating project `AGENTS.md` files
- participating project root `BACKLOG.md` files

Initial participating projects:
- DOKUNTAG Agent OS
- DKNTG Studio
- DOKUNTAG Apps
- DOKUNTAG Publish

## Compatibility and migration impact

Additive documentation/governance change only. No product source, runtime architecture, database, package manifest, release configuration, production environment, store listing, or existing roadmap/status system is replaced.

Existing roadmaps, release checklists, status documents, RADAR_ACTIONS, ADRs, and handoffs keep their current ownership. The backlog stores only unresolved executable deferred work.

## Rollback

Remove the project `BACKLOG.md` files and revert the corresponding startup references in project/workspace agent instructions. No product data or runtime migration is required.

## Validation

- repository state reconciled before edits;
- pre-existing dirty Publish working copies were not modified;
- a clean synchronized Publish governance worktree was used instead;
- `git diff --check` passes for changed Git repositories;
- no source/build/package/runtime files changed;
- GitHub Actions path filters were inspected before deciding whether to push;
- no production deploy or store action was performed.

## Operational decision

Completed backlog items are removed after their actual done condition is verified. They are not retained as a permanent DONE list. Git history and the project's existing durable status/handoff/changelog mechanisms provide completion history.

Ambiguous urgency never becomes NOW by guesswork. Explicit owner urgency and the objective blocker criteria in the standard control escalation.
