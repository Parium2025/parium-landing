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
| **spline-3d-integration** | `/spline-3d-integration` | "embed Spline scene", "add Spline", "3D scene from Spline" |
| **banana** | `/banana` | "generate an image", "create a photo", "edit this picture", "design a logo" |
| **cinematic-site-components** | `/cinematic-site-components` | "cinematic effect", "cursor trail", "kinetic marquee", "mesh gradient", "split scroll", "text scramble", "zoom parallax", "sticky cards", "dynamic island" |

## Marketing Skills (40 st — av Corey Haines)

Börja alltid med `/product-marketing-context` — den sätter grunden för alla andra marketing skills.

| Kategori | Skills |
|----------|--------|
| **SEO** | `/seo-audit`, `/ai-seo`, `/programmatic-seo`, `/schema-markup`, `/site-architecture` |
| **CRO** | `/page-cro`, `/form-cro`, `/onboarding-cro`, `/signup-flow-cro`, `/paywall-upgrade-cro`, `/popup-cro`, `/ab-test-setup` |
| **Innehåll & Copy** | `/copywriting`, `/copy-editing`, `/content-strategy`, `/social-content`, `/email-sequence`, `/cold-email` |
| **Betald trafik** | `/paid-ads`, `/ad-creative` |
| **Tillväxt** | `/launch-strategy`, `/referral-program`, `/lead-magnets`, `/free-tool-strategy`, `/marketing-ideas`, `/community-marketing` |
| **Analys & Research** | `/customer-research`, `/competitor-profiling`, `/competitor-alternatives`, `/analytics-tracking` |
| **Produkt & Revenue** | `/pricing-strategy`, `/churn-prevention`, `/revops`, `/sales-enablement`, `/product-marketing-context` |
| **Övrigt** | `/aso-audit`, `/directory-submissions`, `/marketing-psychology`, `/image`, `/video` |

## Awesome Claude Skills (27 st — av ComposioHQ)

| Kategori | Skills |
|----------|--------|
| **Business & Marketing** | `/brand-guidelines`, `/competitive-ads-extractor`, `/domain-name-brainstormer`, `/internal-comms`, `/lead-research-assistant` |
| **Innehåll & Kommunikation** | `/content-research-writer`, `/meeting-insights-analyzer` |
| **Kreativ media** | `/canvas-design`, `/image-enhancer`, `/slack-gif-creator`, `/theme-factory`, `/video-downloader` |
| **Utveckling** | `/artifacts-builder`, `/changelog-generator`, `/developer-growth-analysis`, `/mcp-builder`, `/skill-creator`, `/webapp-testing` |
| **Produktivitet** | `/file-organizer`, `/invoice-organizer`, `/raffle-winner-picker`, `/tailored-resume-generator` |
| **Dokument** | `/document-skills-docx`, `/document-skills-pdf`, `/document-skills-pptx`, `/document-skills-xlsx` |

## MCP Servers

- **Trigger.dev** (`mcp__trigger__*`) — deploy, test, and monitor Trigger.dev automations

## Conventions

- Skills live in `.claude/skills/[skill-name]/SKILL.md`
- Rules live in `.claude/rules/` and are imported above with `@`
- Supporting reference docs live alongside their skill's `SKILL.md`
- Never hardcode API keys — use environment variables
