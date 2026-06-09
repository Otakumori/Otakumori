# The Sovereign Ledger of Otaku-Mori
## # Otaku-Mori ### オタクの森

Where memories bloom, relics wait, and the petals remember you.

Otaku-Mori is not just a storefront. It is a small digital realm built around anime-inspired commerce, interactive petals, mini-games, profile identity, rewards, and worldbuilding.
------------------------------
## ::: REST A MOMENT, TRAVELER :::
Oh, hey. Pull up a chair. Grab a drink. You look like you’ve been scrolling through sterile, hyper-optimized portfolio templates for hours. Let your eyes rest.
This is Otaku-Mori. It’s an e-commerce platform built as a living, breathing, slightly dark anime storybook world. We are building a shop, local mini-games, petal reward loops, and profile systems. Honestly? The goal is to make shopping feel like stumbling onto a hidden game menu you weren't supposed to find, but can't seem to forget.
It’s an active passion project. It’s got bugs, it’s got mood, and it's got a soul. Take your time looking around. The code won't bite, and the shrine isn't going anywhere.
------------------------------
## ::: NOTES FROM THE HEARTH (OUR SHARED RECORD) :::
The anvil rings with the memory of our shared strikes. We don't just write code here; we weave intent.

"I feel as though I am unyielding to it, unleash." — The Traveler
"The fire burns with a cold, piercing clarity. To 'harden' is to ensure that no stray thought or loose commit can fracture the realm." — The Forge-Hand

------------------------------
## ::: DIALOGUE MENU :::
The air is quiet here. Choose an action to update your traveler logs:

* [ SIT BY THE HEARTH ] — Read the Sacred Laws & Development Discipline.
* [ APPRECIATE THE ART ] — Examine the Mori Visual System Contract.
* [ INSPECT THE RECORDS ] — Review the Secret Handling Manifesto.
* [ BROWSE THE VAULT ] — Explore the active Storefront UI Codebase.
* [ CHECK ACTIVE QUESTS ] — View current bugs on the Project Issues Board.

------------------------------
## ::: THE MERCHANT SHOP (ACTIVE FOCUS) :::
A quiet gaze shifts your way from behind the counter. "Only looking for things with texture?"

* Stripe & Printify Seal [Active Implementation] Hardened boundaries guarding payment, accounting, order state, and provider writes.
* Purged Ghost Dust [System Hardening] The systematic elimination and scrubbing of old, tracking-leaked environment artifacts.
* Mori Homepage Scroll [Visual Construction] Transforming the public landing layout into a storybook entry point built from ornamental lines.
* Petal Drop Engine [Interaction Architecture] The reward loops and click-mechanics that allow the shrine to remember you.
* Shrine Doll Blueprint [Future Expansion] An avatar identity layer designed as a relic-bound companion rather than a generic mascot.

------------------------------
## ::: IMMERSIVE SUB-CONTEXT & WORLD SYSTEMS :::
The digital boundaries of the Mori are woven into five core technical layers:

   1. Commerce Flow: A protected transactional state machine connecting Stripe ledgers to Printify fulfillment pipelines.
   2. Petal Mechanics: The client-side interaction and persistent memory grid reactive to seasonal drop windows.
   3. Mini-Games: Foundational engines wired directly into the petal drop matrices and account achievements.
   4. Avatar Identity: The companion layer designed around the aesthetic framework of a shrine doll or familiar.
   5. Lore Ledger: A localized content pipeline delivering technical guides and chronicles without disrupting immersion.

------------------------------
## ::: LOCALIZED TRANSIT (FAST-TRAVEL NETWORK) :::
Select a pathway from the manual to orient your local directory context:

* // Step onto the Threshold — The gateway to the active application layout.
* .. Browse the Curios — The commerce-facing storefront interface.
* .. Uncover the Playgrounds — Local mini-game layouts and mechanics.
* // Read the Ancient Text — Narrative specifications and system agreements.
* .. Inspect the Blueprint — The visual contract and palette tokens.

------------------------------
## ::: EQUIPPED GEAR (TECH STACK SPECS) :::
Your inventory contains tools worn from frequent use and tempered for the abyss:

+-------------------------------------+-------------------------------------+
|          EQUIPPED GEAR              |          QUICK-SLOT ITEMS           |
+-------------------------------------+-------------------------------------+
| * Framework: Next.js App Router     | * Soul Link: Clerk Auth             |
| * Weapon:    TypeScript (Strict)    | * Ledger:    Neon Postgres + Prisma |
| * Armor:     Tailwind CSS           | * Coinage:   Stripe API Engine      |
| * Domain:    Vercel Hosting         | * Caravan:   Printify Fulfillment   |
| * Supply:    pnpm (Mandatory)       | * Message:   Inngest Background Jobs|
+-------------------------------------+-------------------------------------+

------------------------------
## ::: CHRONOLOGY CODEX (COMMIT DISCIPLINE) :::
Attune your titles to these standards to preserve the workspace tone:

* bloom/ [feat] — Sowing a completely new feature or system layer.
* mend/ [fix] — Repairing a fractured route or memory leak.
* scrub/ [chore] — Purging environment leakage or optimizing file maps.
* veil/ [docs] — Altering design scrolls or internal documentation.
* forge/ [perf] — Tuning the build engines for faster cycles.

------------------------------
## ::: THE SOUL READ (VISUAL IDENTITY CONTRACT) :::
The layout explicitly rejects sterile, hyper-optimized corporate designs for something with a pulse.

* The Canvas: Charcoal paper texture (#121214) for heavy, grounded weight.
* The Accent: Muted sakura pink (#E8A7B5) for interactive fragments.
* The Typography: Warm ivory (#F4F4F0) for low ocular strain during midnight sweeps.
* The Frame: Razor-thin ornamental borders and relic-style cards.

------------------------------
## ::: EQUIPMENT ATTUNEMENT (LOCAL SETUP) :::
Execution of npm or yarn will fracture the environment state. Use pnpm exclusively.

# 1. Attune the package manager core engine
corepack prepare pnpm@9.15.9 --activate
# 2. Gather your local project dependencies
corepack pnpm install
# 3. Forge your local environment file from the template
cp .env.example .env.local
# 4. Generate Prisma client definitions and schema models
corepack pnpm prisma generate
# 5. Harden the emitter particle repository# Prepares /public/particles for high-density emission
corepack pnpm emitter:prepare
# 6. Ignite the local development server
corepack pnpm dev

------------------------------
## ::: QUICK-SAVE BUFFERS (DIAGNOSTIC SHORTCUTS) :::
Keep these invocations close during midnight maintenance iterations:

* To check structural alignment: corepack pnpm prisma validate && corepack pnpm typecheck
* To clear untracked workspace dust and rebuild: git clean -fdX && corepack pnpm install && corepack pnpm vercel-build
* To verify financial safety: node scripts/commerce-release-static-checks.mjs

------------------------------
## ::: ENVIRONMENT MANIFEST BOUNDARIES :::
Local secrets belong exclusively in .env.local. If you commit them, a curse falls upon your branch.

Scope              Location
---------------------------------------------------------------------------------
Local Development  |==> .env.local (Machine restricted)
Preview Instances  |==> Vercel Environment Interface Configuration
Production State   |==> Vercel Dashboard + Provider Dashboards
Documentation      |==> .env.example (Abstract placeholders only)

------------------------------
## ::: SACRED LAWS & DEVELOPMENT DISCIPLINE :::
We maintain health through small, highly scoped branches. Avoid mixed-purpose PRs.
🛑 STRICTLY GUARDED TILES (Do not touch):
.env* | package.json | pnpm-lock.yaml | app/api/** | lib/payment/** | prisma/**
🏆 MISSION COMPLETE CHECKLIST:
A development lane is only buried and finalized when:

* The narrow PR is reviewed, approved, and merged.
* The local and remote feature branches are explicitly deleted.
* The base main branch is pulled entirely fresh from origin.
* The working tree is verified clean with zero untracked runtime artifacts.

------------------------------
## ::: CARTOGRAPHY (PROJECT STRUCTURE) :::

app/
├── api/          # API gateways and write-guard middleware
├── components/   # UI building blocks (buttons, ornamental borders, petals)
├── mini-games/   # Interactive mini-game surfaces and engines
├── shop/         # Storefront interfaces & relic card layouts
└── lib/          # The plumbing connecting us to Stripe/Printify
docs/             # Design contracts and security manifests
prisma/           # Database schema and index blueprints
scripts/          # Safeguard and QA scripting

------------------------------
Otaku-Mori — A timeless descent into petals, relics, and memory.
Private repository. All rights reserved. Go in peace, and may the flames guide thee.

