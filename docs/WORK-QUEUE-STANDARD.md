# DOKUNTAG Work Queue Standard

Status: Active
Version: 1.0
Approved by: Product Owner
Effective date: 2026-10-03

## Purpose

Keep small or non-urgent project work from interrupting active conversations, forcing unnecessary builds/deploys, or being forgotten. Each participating project keeps one root `BACKLOG.md` containing only unresolved work.

## Priority classification

### NOW
Use NOW only when at least one of these is true:

- the Product Owner explicitly says the work is urgent, immediate, or should be done now;
- production is broken or users are materially blocked;
- there is a verified security, privacy, data-loss, or correctness risk that should not wait;
- an active store/release/deploy submission is blocked;
- the current authorized task cannot continue without the fix;
- a concrete deadline or active release window makes delay materially harmful.

An agent must not classify work as NOW merely because it is easy, interesting, newly discovered, or related to the current file.

### BATCH
Default for useful, understood, non-urgent work that should be grouped with a later related change, maintenance pass, release, or deploy.

If urgency is unclear, do not promote the item to NOW. Prefer BATCH when the work is already desirable and sufficiently understood.

### LATER
Use for ideas, experiments, possible enhancements, research questions, or work whose value/scope is not yet sufficiently decided.

## Item state

Allowed active states:

- `READY` — eligible when its trigger is reached.
- `IN_PROGRESS` — selected in the current authorized work.
- `BLOCKED` — cannot proceed; record the blocker and next condition.
- `WAITING_OWNER` — an owner decision/approval is required.
- `AWAITING_RELEASE` — implementation is ready but the requested outcome still depends on release/deploy/store publication.

Completed work is not kept as `DONE` in the active queue.

## Trigger

Every BATCH/LATER item should have a short trigger when useful, for example:

- `next-related-change`
- `next-release`
- `next-deploy`
- `maintenance`
- `owner-request`
- a concrete external event or date

The trigger is a retrieval hint, not permission to bypass repository governance or Product Owner gates.

## Pulling queued work into an active task

At task start, after repository reconciliation and project startup documents, read `BACKLOG.md` when present.

A BATCH item may be included automatically in the same work package only when all of the following are true:

1. same repository and same functional area/surface;
2. low risk and small scope;
3. no new owner-gated decision, production mutation, billing, secret, store, destructive, or cross-project action;
4. no material architecture or product-scope expansion;
5. it can reuse the same validation/build/deploy cycle rather than causing a separate expensive cycle;
6. doing it does not delay or endanger the primary task.

Otherwise leave it queued and surface it only when relevant.

LATER items are not implemented automatically. They require an explicit owner decision or a task whose approved scope clearly includes evaluating them.

## Adding new work

When the Product Owner says an item can wait, should be done later, is a future improvement, or is not worth interrupting the current task for, add it to the target project's `BACKLOG.md` instead of implementing it immediately.

When an agent discovers a non-urgent improvement during work, it may add a concise BATCH/LATER item if it is concrete and relevant. Do not fill the queue with speculative cleanup.

If the target repository is dirty/diverged or otherwise unsafe to mutate, do not add the file/item there merely to record it. Report `SYNC_PENDING` and preserve the task in the safest existing coordination context until the repository can be reconciled.

## Completion lifecycle

When a queued item is selected, set it to `IN_PROGRESS`.

Remove the item from `BACKLOG.md` only after its actual definition of done is verified.

Examples:

- code change + local validation requested -> remove after validation;
- fix + production deploy requested -> keep as `AWAITING_RELEASE` until deploy/smoke verification is complete;
- store publication requested -> keep until the required store step is complete or explicitly handed off;
- partial completion -> keep the remaining work in the item;
- blocked -> keep as `BLOCKED` with the reason;
- owner decision required -> keep as `WAITING_OWNER`.

After verified completion, remove the item in the same meaningful checkpoint. Git history records that it existed. If the result is significant for future sessions, record the durable outcome in the project's existing changelog, current-state, handoff, release note, ADR, or status mechanism.

Do not maintain a permanent DONE archive inside `BACKLOG.md`.

## Minimal entry format

Use the lightest format that preserves intent:

```md
### Short title
- State: READY
- Area: apps
- Trigger: next-related-change
- Risk: low
- Added: 2026-10-03
- Done when: concise observable completion condition
- Notes: optional context
```

For a tiny obvious item, Area/Notes may be omitted. State, Trigger (for deferred work), Added date, and Done when should normally remain.

## Queue hygiene

- Keep the queue short and current.
- Do not duplicate roadmap, issue tracker, release checklist, RADAR_ACTIONS, or product status content.
- External radar findings remain governed by RADAR_ACTIONS and do not become implementation authority merely by being copied into a backlog.
- Roadmap items stay in the roadmap unless they become concrete executable near-term work.
- One item should describe one coherent outcome.
- Merge duplicate items rather than accumulating variants.
- Remove stale/no-longer-wanted items; record a durable product decision elsewhere only when it matters.
