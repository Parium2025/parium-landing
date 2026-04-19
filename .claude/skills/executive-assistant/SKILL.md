---
name: executive-assistant
description: Set up a personal executive assistant and second brain in Claude Code. Use when someone wants to initialize an EA system, set up a second brain, create a personal assistant project, or onboard Claude as their chief of staff.
disable-model-invocation: true
---

# Executive Assistant — Second Brain Setup

Set up this project folder as a personal executive assistant / second brain. Complete each phase fully before moving to the next.

## Phase 1: Create the Folder Structure

Initialize a git repo in this folder if one doesn't exist already.

Create the following template structure (placeholder files only — no content yet):

```
CLAUDE.md                           # Main brain file (filled in Phase 3)
CLAUDE.local.md                     # Personal overrides (git-ignored)
.gitignore                          # Ignore .env, CLAUDE.local.md, settings.local.json
.claude/
  settings.json                     # Empty JSON object for now: {}
  rules/                            # Rule files added in Phase 3
  skills/                           # Empty — built over time
context/
  me.md                             # About me (filled in Phase 3)
  work.md                           # Business/work details (filled in Phase 3)
  team.md                           # Team (filled in Phase 3)
  current-priorities.md             # Current focus (filled in Phase 3)
  goals.md                          # Quarterly goals and milestones (filled in Phase 3)
templates/
  session-summary.md                # Session closeout template
references/
  sops/                             # Standard operating procedures
  examples/                         # Example outputs and style guides
projects/                           # Active workstreams
decisions/
  log.md                            # Decision log (append-only)
archives/                           # Completed/outdated material
```

For empty directories, create a `.gitkeep` file so git tracks them.

**`templates/session-summary.md`** starter:
```markdown
# Session Summary

**Date:**
**Focus:**

## What Got Done
-

## Decisions Made
-

## Open Items / Next Steps
-

## Memory Updates
- Preferences learned:
- Decisions to log:
```

**`decisions/log.md`** starter:
```markdown
# Decision Log

Append-only. When a meaningful decision is made, log it here.

Format: [YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...

---
```

**`.gitignore`**:
```
.env
CLAUDE.local.md
.claude/settings.local.json
node_modules/
```

**`CLAUDE.local.md`**:
```markdown
# Local Overrides

Personal preferences and overrides that don't get shared via git.
Add anything here that's specific to your local setup.
```

---

## Phase 2: Onboarding Interview

Before filling in context files, interview the user. Ask ONE SECTION AT A TIME. Wait for answers before moving to the next section.

### Section 1: About You
- What's your name?
- What's your role/title?
- What's your timezone?
- In one sentence, what do you do?
- What's your #1 priority — the thing everything else should support?

### Section 2: Your Business / Work
- What's your company or business called?
- What are your products, services, or revenue streams? (List each with a one-liner)
- Roughly how much revenue does each generate? (optional)
- What tools do you use day-to-day? (ClickUp, Notion, Slack, Google Workspace, etc.)
- Do you have any MCP servers connected to Claude Code?

### Section 3: Your Team
- Do you have a team? If yes, how many people?
- Who are the 2-3 key people I should know about? (name, role, when to loop them in)
- Where does your team communicate?
- What's your biggest pain point with managing your team?

### Section 4: Priorities, Goals & Projects
- What are the 3-5 things you're most focused on right now?
- Any deadlines or time-sensitive items?
- Do you have quarterly goals or milestones you're tracking?
- What active projects or workstreams are you managing?

### Section 5: Communication Preferences
- How do you like information presented? (bullets, paragraphs, etc.)
- Any writing pet peeves? (e.g., "never use emojis", "no em dashes")
- Internal tone? (casual, professional, etc.)
- External/public-facing tone?

### Section 6: What Do You Want Help With?
- What recurring tasks eat up your time?
- What would you hand off to an assistant first?
- Any specific workflows to automate or templatize?

---

## Phase 3: Build Out the Files

### Context files (based on interview answers)
- **`context/me.md`** — profile from Section 1
- **`context/work.md`** — business details from Section 2
- **`context/team.md`** — team structure from Section 3 (if solo, note it and skip)
- **`context/current-priorities.md`** — priorities from Section 4, dated today
- **`context/goals.md`** — quarterly goals from Section 4. Label with current quarter (e.g., "Q2 2026"). Add note: "Update this file at the start of each quarter."

### Projects
If active projects were mentioned in Section 4, create a folder for each in `projects/`. Each gets a brief `README.md` with:
- One-line description
- Current status (active, planning, on hold)
- Key dates or deadlines

### Rule files in `.claude/rules/`
Based on Section 5 communication preferences:
- **`communication-style.md`** — tone, formatting, pet peeves
- Add others only if clear domain-specific rules emerged

Keep each rule file focused on ONE topic. Max 3-4 rule files to start.

### `CLAUDE.md` — the main brain file (keep UNDER 150 lines)

Must contain:
1. One-line identity ("You are [Name]'s executive assistant.")
2. Top priority (#1 thing everything supports)
3. Context imports using `@context/me.md`, `@context/goals.md`, etc.
4. Tool integrations (what's connected)
5. Skills directory pointer (`.claude/skills/`)
6. Decision log pointer (`decisions/log.md`, append-only)
7. Memory section explaining how it works out of the box
8. Maintenance section (update priorities when focus shifts, goals each quarter, log decisions)
9. Projects pointer (`projects/`)
10. Templates pointer (`templates/`)
11. Archives rule (don't delete, archive)

Do NOT put communication style in CLAUDE.md — those go in `.claude/rules/`.
Do NOT repeat content from context files — import with `@`.

---

## Final Step

After everything is created:
1. Show a tree view of every file and folder created
2. Brief summary of each file (one line per file)
3. List "Skills to Build" backlog from Section 6 answers
4. Show this maintenance cheat sheet:

**Keeping Your Assistant Sharp**
- **Weekly:** Nothing required. Auto-memory handles daily learnings.
- **Monthly:** Glance at `context/current-priorities.md`. Update if focus has shifted.
- **Quarterly:** Update `context/goals.md` with new goals and milestones.
- **As needed:** Log decisions in `decisions/log.md`. Add reference files. Build new skills.
- **Pro tip:** Say "Remember that I always prefer X" and it saves across all future conversations.

5. Create the first git commit
6. Ask if the user wants to build any of those skills right now

---

## Important Rules

- Do NOT create any skills during setup. Skills directory should be empty after Phase 3.
- Keep CLAUDE.md UNDER 150 lines.
- Use `@` imports in CLAUDE.md instead of repeating information.
- One rule file = one topic. Max 3-4 rule files to start.
- Ask onboarding questions ONE SECTION AT A TIME.
- If user says "skip" for any section, create a placeholder file and move on.
