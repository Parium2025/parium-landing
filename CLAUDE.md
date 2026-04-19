# Parium

This is a Claude Code skills repository. Skills define reusable workflows invoked via `/skill-name` or natural language triggers. Rules in `.claude/rules/` apply automatically to all relevant work.

## Goal

Build a **premium 3D website** — immersive, scroll-driven, Three.js-powered.

## Always-On Rules

@.claude/rules/frontend-website.md

## Available Skills

| Skill | Command | Trigger |
|-------|---------|---------|
| **3d-website** | `/3d-website` | "build a 3D site", "add Three.js", "immersive landing page" |
| **frontend-design** | `/frontend-design` | "build a component", "design a page", "create UI" |
| **video-to-website** | `/video-to-website` | "turn this video into a website" |
| **workflow-builder** | `/workflow-builder` | "automate this", "build a Trigger.dev task", "schedule this" |
| **trigger-ref** | `/trigger-ref` | Full Trigger.dev SDK code reference |
| **executive-assistant** | `/executive-assistant` | "set up my EA system", "second brain setup" |
| **excalidraw-diagram** | `/excalidraw-diagram` | "draw a diagram", "make an Excalidraw" |
| **skill-builder** | `/skill-builder` | "create a new skill", "optimize this skill" |

## MCP Servers

- **Trigger.dev** (`mcp__trigger__*`) — deploy, test, and monitor Trigger.dev automations

## Conventions

- Skills live in `.claude/skills/[skill-name]/SKILL.md`
- Rules live in `.claude/rules/` and are imported above with `@`
- Supporting reference docs live alongside their skill's `SKILL.md`
- Never hardcode API keys — use environment variables
