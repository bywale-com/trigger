# Phase One — log

**Current (read first, then the newest stamp at the bottom):** 14:39 UTC 2026-10-19 — cadence, Pages, and expansion through decomposition. Founder excerpts below. A CTO synthesis was studied and is not the flag. Overview not amended. Architecture not authorized.

**How we maintain this log**

- Talk lands here unless the founder marks a separate entry. Append-only, newest at bottom.
- Do not edit a past stamp. Corrections are a new stamp. Only **Current** moves in place.
- Cadence floor in session: at least four stamps a day.
- Founder wording. Excerpts. No substitute flag list.
- Do not mint tables here.

---

## 13:30 UTC 2026-10-19 — sitting protocol imported

**Kind:** founder ask, filed.

**Founder wording:**

> You will be our first technical product manager.
>
> Firstly, I need you to import our agents sitting protocol from 'https://github.com/bywale-com/travis'
>
> Basically our travis repo.
>
> That will make many things easier to follow, including the protocols for each type of persona, do that first

**What changed**

- House protocol files copied byte-identical from `bywale-com/travis` `a47becfc400d050bd6019651026d9445e8b6c914` (2026-10-18, “Research Travis load-bearing implementations”) into [`protocols/`](../../protocols/). Source path there: `docs/register/house-now/protocols/`.
- Sit paths stay locked: `pm`, `sa`, `engineer`. `travis.md` is the facilitator, not a Cursor seat. `WHERE.md` and `logging.md` are handed with every sit and are not sit paths.
- Seat READMEs, [`BUILD-PROTOCOL.md`](../BUILD-PROTOCOL.md), and [`00-rudiments.md`](../build-foundation/00-rudiments.md) copied so Accept can be followed. Banners mark Travis planted-state as source history.
- This repo’s trails opened empty. Next SA packet is `001`. Next hotfix is `001`.

**Agent alignment (not a flag):** Trigger is the work repo. The imported protocol is how personas sit. Travis’s product flag is not Trigger’s flag.

**Ask:** none. Waiting for the next founder ask.

---

## 13:40 UTC 2026-10-19 — product overview filed beside the log

**Kind:** founder separate entry. Pointer only. The overview is not pasted into this log.

**Founder instruction:**

> Add a pointer in the logs. Don't actually append this to the logs. Save this verbatim near the logs.

**Pointer:** [`PRODUCT-OVERVIEW.md`](./PRODUCT-OVERVIEW.md) — Product Overview V0.1, October 19, 2026, saved verbatim next to this file.

**Status on that document:** Vision captured; architecture and implementation not yet authorized. Next stage named there: architectural and implementation planning, when separately authorized.

**What changed:** the file. This stamp does not restate it. The 13:30 stamp is unchanged.

---

## 13:50 UTC 2026-10-19 — seed, and the grain that stops

**Kind:** founder discussion. Excerpts. Not a locked grain. Not an authorization to architect.

**Founder wording:**

> The problem with decoupling UI for systems. We ran into this problem where we were retrospectively looking to map the state changes and mutations caused by UI interfaces and interactions.
>
> The evolved version had us building both together. We build a self-contained UI layer — meaning its dependencies were considered, factored in and specified alongside the UI component. We didn't simply think of the UI idea and move on. We had to complete the thinking for each packet.
>
> Whatever the unit of a task inside of a trigger row, it must somehow contain everything required to make the seed function work.
>
> There's always a trigger that starts the thinking towards a functionality or component or feature. That thing is the seed.
>
> With Travis, we recognized a critical bottleneck was needing to log back into Cursor to log an issue. So the Look module exists to quickly log an issue without needing to log back into Cursor and recreate from memory or needing to perfectly describe the issue. The risk is that it might seed the wrong thing into the description of the solution.
>
> The Look modal allowed us to accurately capture the problem, without needing to depend on me to re-enact the problem.
>
> Seed plus first implementation idea creates considerations, but there must be an end. It can't go on forever. The retrospective question is: could Look have resolved into the boundedness that it ultimately developed into, or would it have gone on and on, even into other modules?
>
> Everything within it is what I think a unit of work is. Specified to a grain that keeps it self-contained.
>
> Is it all just system message / synthesized methodology that we're chasing and a place to organize that decomposition? Or is there some harness engineering in there?
>
> What part would Cursor even play here? Is it the building? Very possible. No need to invent a build harness. It's the decomposition. But then why wouldn't Cursor be ok for that? Is it just avoiding responsibility for maintaining the agent?

**Read back, as asked.** Overview §8, still undecided: a packet must be precise enough for an agent to execute, and meaningful enough for the factory to verify. Grain follows from the work and from whether the intended result can be shown. §8.1: the obligation survives a failed attempt. Seat law beside that: one module, list the perimeter it forces open, those outskirts are the next entries. A packet holds face and technical grain together. Leftover grain means it is not ready.

**Agent alignment (not a flag):** The row holds a seed. The unit inside it is closed when it contains the face and the mutations that face causes, and when a check can show the seed happened. Further modules are the next seeds. Cursor builds an authorized unit. Trigger keeps the seed, the stop, and the check. That is the picture in this chat. It does not amend the overview.

---

## 14:39 UTC 2026-10-19 — cadence, Pages, expansion through decomposition

**Kind:** founder discussion, brought with a CTO synthesis for study. Detailed. Not a lock on cadence, version policy, or a feature inventory. Not an authorization to architect. [`PRODUCT-OVERVIEW.md`](./PRODUCT-OVERVIEW.md) is unchanged.

**Studied and not the flag.** The same paste contains two long CTO replies. They propose a split between a structural pass and a completion-driven pass, three rhythms, a V1 boundary test, two boundaries (seed and version), structural closure and evidential closure, “unfinished V1 is not V2,” Pages as a congruent realization of the table, How Analysis continued through mechanism, three kinds of inference (necessary, compatible, optional), a recursive stop, and four intellectual operations that are not four services. Those replies were read. They are not founder wording.

### Founder — the cadence question, and the page

> What is the rate or cadence of decomposition? The answer is actually non-obvious. It is not some kind of engineering feat.
>
> Structurally, most things at least can be determined ahead of time. For V1, a lot of that can exist. A lot of that should be able to decompose and specify. Even though it is general, the grain is not surface. It can go very deeply. It is not everything that could ever exist for V1. What it does set is a boundary.
>
> Interrogate V1 of Trigger. It is going to be table-based, but not just any kind of table. Think about Notion’s pages embedded within table rows. Each row is its own page. The title of the page is the seed. Within each page you have that self-contained function, component, whatever. That works really well.
>
> If that is the core of the product — 50% or 60% or even 70% of what needs to exist and why — then everything else is supporting that core feature. The core of every version, the majority of what it consists of, can be determined on the first thorough decomposition pass.
>
> Which brings the actual cadence. If one cycle is enough to produce that much, what determines how many cycles of decomposition will happen, on what schedule?
>
> Ultimately it is still V1. What would V2 look like? Is it possible for one of these cycles to break out of its boundary and start moving into V2? How would we detect that?

### Founder — Pages is the addition, and the method

> Think about the exact addition I just made to Trigger. Pages. Not the concept, the component.
>
> Since the inception of Trigger, we have implied this, even stated this. Then the last pass installed “seed,” further specifying that, and now pages. This is what the decomposition itself is.
>
> Can the system congruently decompose the product into features?
>
> It is a type of expansion by decomposition, not necessarily extension. Expansion through decomposition and modularization.
>
> This is something we pioneered with Tower: click-paths, seed, world, and especially the How Analysis. The problem with those was that they were UI-first and honestly UI only. They answered incredibly well what click paths, interfaces, modules, and UI components should exist, from relatively little specification.
>
> The evolution with this is: do not stop at the UI, but do the exact same thing.

**How Analysis as it is written** in the Travis method this seat read (`docs/build-foundation/01-ui-first-and-how.md` there, not copied into this repo except the rudiments pointer): UI prototype, then How, then flow, then implement. A child question must cut from a phrase in the parent answer. Until a true leaf, language stays user-visible. Process language is allowed at the leaf. Stop when the next How would repeat the parent or go invisible too early. Components point at appearance first.

### Agent alignment (not a flag)

Pages, the component, is the founder’s addition in this stamp. A row opens into its own page. The title is the seed. The page holds the self-contained function. The overview still says the grain of a row is a design question. This stamp records the addition. It does not rewrite the overview.

The first thorough pass derives V1 from that core. Support exists because the page needs it. The pass may go deep. Depth is allowed. A clock is not the cadence. Another cycle starts when a parent still cannot be shown, or when a build or a verification shows the derivation was wrong. That cycle re-cuts the parent and records neighbors. It does not reopen the whole product because time passed.

A discovered node stays in V1 when the established V1 behaviour cannot happen without it. A discovered node is outside V1 when it is a new promise. Multi-project management and a portfolio of analytics are already outside, in the overview. Usefulness does not pull them in. Finding them during a pass is allowed. Promoting them is a version decision. Unfinished work inside the existing promises stays V1.

Detection that a cycle is leaving the version is the same DNA rule How already uses: the child has to trace to the parent. If it cannot be cut from the seed, the page, or the V1 promises already stated, it is a neighbor, not more of this version.

The evolution of How is where the cut is allowed to finish. The face, the state it writes, the mechanism that keeps authorship off the build, and the proof that the seed happened, belong in the same parent. Process language is part of completing that parent. The leaf is when the parent can be demonstrated. An invisible obligation can be required and still have no screen of its own.

Cursor still builds. The page is the place the derived structure is held. This alignment does not authorize architecture, a seed inventory, or an automated classifier for borderline cases. A borderline case is a decision on the row.
