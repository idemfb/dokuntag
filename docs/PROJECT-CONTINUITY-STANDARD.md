# DOKUNTAG Project Continuity Standard

Status: Active
Version: 1.2
Approved by: Product Owner
Effective date: 2026-10-03

## Purpose

A chat is a working surface, not the durable memory of a DOKUNTAG project. A project must remain safely resumable if a chat reaches its limit, is deleted, is unavailable, or a different AI/model continues the work later.

The durable continuation source is the workspace/repository documentation plus Git state, not a copied chat transcript or a long handoff prompt.

## Core rule

If the Product Owner names a known project and says a natural continuation phrase such as:

- "Studio'da devam edelim"
- "Agent OS'a devam"
- "Publish'e devam"
- "Apps'e devam"
- "DOKUNTAG'a devam, bugün nereden başlayalım?"

the agent must reconstruct the relevant context from durable project sources. Do not ask the Product Owner to paste the previous chat or generate a long continuation prompt when the project can be recovered from disk/Git.

Ask only for a genuinely missing decision or intent that cannot be recovered from the project's authoritative records.

## Continuation sources

Use the workspace project registry in `PROJECTS.md` to identify the canonical repository and the project's continuity authority.

For a normal named-project continuation, use this order:

1. workspace `AGENTS.md` and `AI-BOOTSTRAP.md`;
2. this standard and `PROJECTS.md`;
3. target repository `AGENTS.md` and local startup rules;
4. the project's declared current-state authority;
5. target `BACKLOG.md`;
6. relevant app/module status, handoff, ADR, roadmap, or checkpoint only as needed;
7. Git reconciliation: working tree, branch, upstream, local/remote ancestry;
8. current external state only when the task actually depends on it.

Do not read every historical handoff or old chat export merely to feel complete.

## Natural resume behavior

After recovery, give the Product Owner a short orientation rather than a large context dump. Normally state:

- where the project currently stands;
- any active blocker or waiting condition;
- the most relevant queued work;
- the next sensible action.

Then continue the requested work or discussion.

A historical `HANDOFF_PROMPT.md` may remain as recovery material, but it is not the normal mechanism for moving to a new chat.

## Project transition and chat guidance

When the Product Owner finishes work in one project and starts another project in the same conversation, the agent should actively recommend whether to continue in the current chat or open a fresh chat. The Product Owner should not have to estimate context size or technical complexity manually.

Prefer **the same chat** when the next work is small and bounded, for example:
- a quick status check or factual question;
- a small backlog/coordination update;
- a short discussion or decision with little implementation context;
- a low-risk change that can be understood and completed without loading a large new project context;
- the current conversation remains focused and reasonably light.

Prefer **a fresh chat** when the next work is materially independent or substantial, for example:
- broad implementation, architecture, research, release, debugging, or multi-step work in a different project;
- the new project requires many project-specific rules, files, or tools;
- the current conversation already contains a large amount of another project's technical context;
- carrying the old context creates a meaningful risk of project confusion, instruction leakage, or lower reasoning quality;
- the outgoing project has reached a clean checkpoint and the next task is a natural independent work session.

The recommendation should be short and useful, for example: `Studio checkpointi kapandı. Agent OS işi kapsamlı görünüyor; yeni sohbet açıp "Agent OS'a devam, şu işi yapalım" demen daha temiz olur.` No long handoff prompt is required.

This is guidance, not a hard gate. If the Product Owner explicitly wants to stay in the same chat, continue safely unless a project-specific rule prevents it.

Before an actual project switch, close the outgoing project's meaningful checkpoint when needed, then bootstrap the incoming project from its own durable sources. Do not carry the outgoing project's implementation assumptions into the incoming project merely because both were discussed in one chat.

## Cross-project idea capture without switching context

A short idea for another known project does **not** require switching the active project or opening a new chat.

Example: while working in Studio, the Product Owner says `Bu arada Apps'te ileride uygulama içi şu özelliği ekleyelim.` The agent should keep Studio as the active work context and route the idea to the Apps work queue.

Rules:
- if the target project is clear, add the item to that project's `BACKLOG.md`, not `WORKSPACE-INBOX.md`;
- use `LATER` for an undeveloped idea/experiment and `BATCH` for a wanted, understood, non-urgent task;
- do not start implementing the other project merely because the idea was recorded;
- use only the minimum target-project checks needed to record safely: identify the canonical repo, re-read the current backlog, and respect Git/sync/dirty-state rules;
- if the target repo cannot be safely mutated because it is dirty, diverged, concurrently changing, or otherwise unsafe, preserve the idea temporarily in `WORKSPACE-INBOX.md` with the intended target project and move it later when safe;
- tell the Product Owner briefly where the idea was recorded, then return to the active project.

If the target project is not clear, use `WORKSPACE-INBOX.md` until ownership is decided.

## Chat-limit resilience

Do not wait for a chat-limit warning to preserve important state.

At every meaningful checkpoint, persist only what the next session truly needs:

- meaningful current-state change -> update the project's existing current-state/status authority;
- deferred executable work -> update `BACKLOG.md`;
- durable architecture/product decision -> update the existing ADR/constitution/rules/status mechanism when appropriate;
- completed implementation -> Git commit at a meaningful checkpoint;
- safe remote synchronization -> push so local PC and canonical GitHub are equal when practical.

When a chat is ending only because it is long, the normal instruction to the Product Owner should be simple, for example:

> Yeni sohbet açıp "Studio'da devam edelim" demen yeterli.

Do not make continuity depend on copying a generated prompt.

## What deserves persistence

Persist:
- decisions that change future behavior;
- real project state changes;
- unresolved blockers or owner decisions;
- deferred work the owner intends to keep;
- release/store/deploy waiting states;
- significant verification evidence needed for the next action.

Do not persist:
- casual discussion that changed no decision;
- temporary reasoning;
- every suggestion or rejected option;
- duplicated chat summaries;
- transient implementation narration already represented by Git.

## Multi-chat / concurrent-work safety

Coordination files such as `BACKLOG.md`, current-state/status files, project registries, and handoffs may be changed by another chat or agent while work is in progress.

Before mutating one of these files, re-read its current contents immediately before the edit when concurrent work is plausible. If it changed since the earlier read, merge from the new state instead of overwriting it.

Never treat an earlier in-chat copy of a coordination file as write authority after another process may have changed the repository.

If another chat has left the same repository dirty or local-ahead and the ownership of those changes is unclear, preserve them and avoid parallel mutation of the same surface. Use a separate safe worktree only when project rules and the active task justify it.

## Workspace Inbox

Use `WORKSPACE-INBOX.md` only for unresolved items that do not yet belong to one project.

Examples:
- a cross-product idea whose owner repository is not yet decided;
- a future DOKUNTAG capability that needs project assignment;
- a general improvement the Product Owner explicitly wants remembered but not acted on yet.

Once ownership is clear, move the item to the target project's `BACKLOG.md` or other proper authority and remove it from the Inbox.

The Inbox is not a second backlog for already-known projects.

## General DOKUNTAG planning conversations

For requests such as "bugün DOKUNTAG için nereden başlayalım?", do not guess from chat memory alone.

Use the active-focus set in `PROJECTS.md`. For each relevant active project, inspect only the minimum current-state authority, backlog, and Git/sync state needed to understand whether work is ready, blocked, waiting, or risky.

Return a concise cross-project picture and a small set of sensible next actions. This scan is advisory: it does not authorize code, deploy, store, billing, secret, destructive, or cross-project mutations by itself.

## Continuity health check

Run a lightweight continuity health check opportunistically rather than on every chat turn. Good triggers include:
- a general planning request such as `Bugün DOKUNTAG için nereden başlayalım?`;
- resuming a project after a noticeable gap;
- a project switch after substantial work;
- any visible `SYNC_PENDING`, stale status date, unresolved waiting state, or coordination inconsistency;
- an occasional maintenance pass when the active project set has changed.

The health check should stay small and local-first. Verify only what is needed to answer:
1. does the project registry still point to a valid canonical repo/current-state authority;
2. is the current-state/status document materially stale or contradictory to Git/recent verified state;
3. does `BACKLOG.md` contain completed, duplicate, stale, or wrongly classified items;
4. are `BLOCKED`, `WAITING_OWNER`, or `AWAITING_RELEASE` items still valid and is their next condition clear;
5. is there any hidden local/remote divergence or `SYNC_PENDING` that the next session should know about;
6. can a fresh chat still resume the project without the previous conversation.

Do not turn this into a full audit, build, deploy, web research pass, or cross-project mutation unless separately authorized. Fix safe documentation/queue hygiene when appropriate; otherwise surface the issue briefly and leave the project untouched.

A healthy result normally needs no long report. It is enough to continue normally or mention a concise issue such as `Publish has one local-ahead checkpoint` or `Apps backlog contains a stale item` when it matters.

## Current-state authority rule

Do not create a new `CURRENT_STATE.md` merely for uniformity when a project already has a concise authoritative status document.

Examples:
- Agent OS may use `CURRENT_STATE.md`;
- Apps may use `docs/PORTFOLIO-STATUS.md` plus app-specific `STATUS.md`;
- Publish may use its declared project-status/handoff authority.

Prefer one clear current-state authority over duplicate status files.

If a project lacks a suitable concise authority, add one only at a safe project checkpoint and link it from that project's `AGENTS.md` or startup document.

## Meaningful checkpoint rule

Before ending substantial work, verify:

1. current-state authority reflects any meaningful state change;
2. backlog contains unresolved work and no verified-complete item;
3. owner-waiting/release-waiting blockers are explicit;
4. Git working tree is understood;
5. local/remote sync is reconciled when safe;
6. the next session can continue without the previous chat.

## PC and GitHub equality

The preferred end state for every Git-backed project is local PC and canonical GitHub at the same verified checkpoint.

Push a meaningful validated checkpoint when safe. Do not leave local-ahead work merely out of habit.

Exceptions are deliberate:
- dirty or uncommitted work whose intent is not yet safely checkpointed;
- diverged history requiring reconciliation;
- a push would trigger an unnecessary or harmful deploy/release/expensive CI cycle;
- an owner gate or external platform step is still required;
- another repository-specific safety rule blocks synchronization.

When equality cannot safely be achieved, record/report `SYNC_PENDING` with the reason and next action. The next relevant session checks it first.

Do not create a docs-only project push solely to improve continuity when that push would trigger an unnecessary production/preview deploy or expensive validation. Keep the project unchanged/equal and attach the continuity-doc improvement to the next meaningful authorized project checkpoint instead; the shared registry must still provide a usable recovery route meanwhile.

Do not force equality with reset, overwrite, force-push, unsafe pull, or by discarding user work.

## Relationship to Work Queue

This standard answers "How can the project continue without the chat?"

The Work Queue Standard answers "What unresolved work should happen now, in a batch, or later?"

Use both:
- current-state authority = where we are;
- `BACKLOG.md` = unresolved executable/future work;
- Git = what actually changed;
- Inbox = unassigned cross-project ideas;
- chat = temporary discussion and execution surface.

## Success condition

A continuity setup is successful when the Product Owner can open a fresh chat and say only the project name plus a natural intent, and the agent can safely reconstruct the current project position without requiring a copied prior-chat prompt.
