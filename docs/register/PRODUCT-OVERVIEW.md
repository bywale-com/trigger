# Trigger — Omcoda Software Factory

**Date:** October 19, 2026  
**Company:** Omcoda  
**Product:** Trigger  
**Initial operating context:** Tower  
**Classification:** Autonomous software factory  
**Document:** Product Overview — V0.1  
**Status:** Vision captured; architecture and implementation not yet authorized

---

# 1. Origin — Why Trigger Exists

Trigger emerges from Omcoda's experience developing software with AI agents.

The existing development process has already demonstrated that a considerable amount of software production can be delegated to agents.

For Tower, development has involved:

- GitHub repositories, branches, issues, and pull requests.
- Cursor agents executing engineering work.
- Product Management and Systems Analysis agents.
- Founder-authored decisions and product methodology.
- Engineering packets specifying bounded implementation tasks.
- Canonical interface specifications and visual plates.
- Implementation instructions, verification requirements, and feedback loops.
- Automated development processes coordinated through GitHub and Cursor.

This arrangement constitutes an early software factory.

However, its operation still requires considerable orchestration.

The founder frequently identifies work, determines the next implementation step, supplies context, prepares or commissions packets, initializes builds, examines results, diagnoses failures, and initiates further work.

The agents perform significant portions of implementation, but the founder remains an important coordinating mechanism.

Trigger is intended to change that relationship.

**The founder should not ordinarily need to identify every unit of work, create its packet, or initiate its build.**

The factory should be capable of carrying out those operations itself, subject to the decisions and authority already established for the product.

The founder retains the ability to intervene or initiate work directly, but routine production should not depend on doing so.

---

# 2. Product Identity

Trigger is Omcoda's software factory.

Its initial purpose is to operate on Tower, using the product's established decisions, documentation, source code, and development infrastructure to determine and carry out the work necessary to realize the intended software.

Although conceived initially for Tower, Trigger is intended to be useful for other Omcoda products.

This future utility does not require a multi-project management interface in the initial product.

Trigger is not fundamentally a replacement for GitHub, Cursor, Linear, or Notion.

Those systems may remain useful as repositories, executors, integrations, or interface precedents.

Trigger governs the production process within which they participate.

**Its purpose is to move software from established product intent toward demonstrated implementation, with as little unnecessary founder orchestration as possible.**

---

# 3. The Two Original Architectural Distinctions

Two distinctions established Trigger's identity relative to the existing GitHub-and-Cursor build factory.

## 3.1 Packets are agent-authored and separately authorized

In the earlier development process, packets have often been generated through directed conversations or explicit founder instructions.

Trigger changes the default.

Agents should be able to identify work, research it, formulate a packet, and prepare it for execution.

Packet authorship becomes a normal responsibility of the factory.

However, creating a packet and authorizing it are not the same operation.

A packet may exist without being approved or eligible to execute.

Its authorization is a distinct consideration.

The precise authorization policy is not yet defined. Authorization may be automated when adequate authority and constraints exist, or require intervention when they do not.

The important established distinction is:

**Authoring work does not itself constitute permission to execute that work.**

## 3.2 Packet construction is decoupled from build initialization

Creating a packet must not automatically initialize its build.

Packets may be discovered, investigated, drafted, refined, checked, authorized, sequenced, or held independently of execution.

A build begins when the system determines that the work is ready and permitted to execute.

This allows preparation and execution to operate independently.

It also permits Trigger to maintain work that is ready but not yet running.

The founder may initiate a build manually, but manual initiation is not supposed to be the ordinary prerequisite.

Together, these two distinctions separate:

**Work discovery → Packet authorship → Authorization → Build initialization**

These operations should not be collapsed merely because an AI agent is capable of performing all of them.

---

# 4. The Central Operating Hypothesis

A major assumption behind Trigger is that much of the software it needs to produce has already been decided.

Tower has an extensive body of existing product knowledge:

- Founder decisions.
- Product methodology.
- Systems architecture.
- Requirements.
- Module definitions.
- UI specifications.
- Historical corrections.
- Implementation packets.
- Source code.
- Existing implementation behaviour.
- Research findings.

The founder's hypothesis is that this material already contains, explicitly or implicitly, most of what is required to realize the intended product.

Some requirements are directly stated.

Others can be derived from established decisions and their necessary consequences.

For example, if a software operation must preserve its outputs through execution recovery, the system necessarily requires some means of retaining or reconstructing those outputs.

The founder should not have to separately specify every technical mechanism implied by an already-established behaviour.

The factory should discover what the product requires and produce the engineering work necessary to make it true.

This creates a crucial shift.

**Instead of waiting for the founder to continuously describe the next feature, Trigger should be able to determine what remains to be fulfilled.**

This is an operating hypothesis, not proof that Tower's complete product definition is already exhaustive.

Trigger must still accommodate previously undiscovered requirements, conflicts, and missing decisions.

---

# 5. Autonomous Work Discovery

Trigger's work does not necessarily begin with a ticket.

It begins with the product and the implementation that currently exists.

The factory should be capable of investigating both.

On one side is the intended software: what decisions and specifications require.

On the other side is the implemented software: what the code, interfaces, database, integrations, and running application actually do.

The difference between them establishes potential work.

Such work might involve:

- Functionality that has not been implemented.
- Functionality that is partially implemented.
- Behaviour that contradicts an existing product decision.
- Missing supporting infrastructure necessary for a required capability.
- A broken relationship between modules.
- A technically incorrect implementation of an otherwise settled requirement.
- A required verification or recovery mechanism.

These examples illustrate the intended discovery function; they are not yet a fixed packet taxonomy.

The factory should not need the founder to notice every discrepancy first.

It should be able to identify relevant work from the available evidence.

Once identified, that work can enter the production system.

---

# 6. The Board — Trigger's Principal Interface

Trigger is envisioned as a **table-first product**.

The founder's mental image is not a large application with numerous dashboards, panels, or management controls.

It is, principally, a table.

The table contains rows representing work moving through the software factory.

The exact grain of each row remains a design question.

Rows have states, stages, and associated operations.

A row may represent work that has not begun, work that is running, work that has completed, or work requiring intervention.

The interface should make it easy to understand what is happening without requiring the founder to supervise every underlying action.

The table is not simply a reporting surface.

It is the primary operating interface through which the factory's work becomes visible and, when necessary, actionable.

## 6.1 Possible precedents

Linear and Notion were identified as potential tools or design references for the board.

Scrum and conventional DevOps workflow concepts were also raised as possible foundations for organizing work.

No final choice has been made to adopt Linear, Notion, a particular Scrum hierarchy, or a particular board implementation.

## 6.2 Stages and phases

The board is expected to represent stages through which work progresses.

The user envisaged a relatively straightforward development and DevOps pipeline.

The exact stage vocabulary, number of stages, ordering, and transition rules remain open.

The intent is not to create process complexity for its own sake.

It is to provide a structured path through which autonomous work can advance and be observed.

---

# 7. Rows and the Context-Dependent Button

An important part of Trigger's interface is the deliberate scarcity of controls.

A row should not necessarily expose numerous action buttons.

It may display **one primary action at most**, depending on what is currently required.

Often, it may display no primary action at all.

The available action is determined by the row's state.

## 7.1 A row that is running

If work is already running, there may be no reason for the founder to interact with it.

The row communicates that work is in progress.

A secondary menu may provide exceptional operations, such as ending or stopping an execution.

But these controls are not the main interface.

The normal operation is autonomous progression.

## 7.2 A row ready to execute

If a row is ready but has not started, the available action may be **Run**.

This permits manual build initiation.

However, Trigger should also be capable of initiating eligible builds without requiring that button to be pressed.

## 7.3 A completed row

A completed row may provide an **Open** action.

This allows the founder to inspect the completed implementation, results, or associated evidence.

The user contemplated visually distinguishing this state with a green presentation.

## 7.4 A blocked row

A row requiring founder intervention may also present **Open**, but with a different visual treatment.

An orange or yellow presentation was considered.

In this case, Open leads to the blocker rather than a completed result.

The exact colors and final labels have not been locked.

The underlying principle is more important:

**The same simple interface can expose different operations according to the condition of the work.**

## 7.5 The deeper UI principle

A lack of buttons is not necessarily a lack of functionality.

It may mean that the factory already knows what must happen and can proceed without assistance.

Human controls should become prominent primarily when there is a meaningful decision or intervention to make.

The goal is not maximum interactivity.

The goal is **minimum necessary intervention**.

---

# 8. Packet Granularity — The Open Decomposition Question

The user raised Scrum as a possible foundation for organizing Trigger's work.

Conventional Scrum-style decomposition includes concepts such as:

- Epics.
- Stories.
- Tasks.

Such a hierarchy may help convert extensive product requirements into appropriately bounded engineering work.

However, the grain of Trigger's packets has not yet been decided.

The question is fundamental because a packet must be sufficiently precise for an agent to execute, yet sufficiently meaningful for the factory to verify and manage.

A very broad packet might be difficult to execute reliably.

An excessively granular packet might introduce unnecessary coordination, dependencies, and overhead.

The ideal packet grain should follow from the nature of the work and the system's ability to determine whether the intended result was achieved.

## 8.1 A distinction proposed during discussion

We explored distinguishing the persistent requirement from the packet used to implement it.

For example:

**Product obligation:** A workflow must preserve an authored output reference across Wait and resumption.

**Implementation packet:** The bounded work prepared to satisfy that requirement.

**Build execution:** An attempt to implement the packet.

**Verification:** Evidence that the resulting system satisfies the original requirement.

The value of this distinction is that a packet can be executed without the underlying requirement necessarily being fulfilled.

A failed implementation attempt must not erase the original requirement.

This was proposed as a way to strengthen Implementation Fidelity.

It is not yet a finalized Trigger data model, and it does not require four separate tables or objects.

The exact representation remains to be designed.

---

# 9. The Production Lifecycle

Trigger should be capable of carrying work through a complete software-production lifecycle.

The conceptual sequence developed in our discussion is:

## Step 1 — Discover

Inspect the relevant product decisions, requirements, implementation, and available evidence.

Identify an unfulfilled requirement, inconsistency, or other necessary work.

## Step 2 — Formulate

Convert the discovered work into a bounded engineering proposal or packet.

Determine what needs to change and why.

## Step 3 — Investigate

Where necessary, inspect existing architecture and established external implementations.

Identify relevant dependencies, constraints, and proven mechanisms.

Avoid needless invention.

## Step 4 — Establish Fit

Evaluate the proposed solution against the product's existing decisions.

Reject or revise solutions that contradict authoritative requirements.

## Step 5 — Authorize

Determine whether the proposed work is permitted to proceed.

This is distinct from drafting the packet.

## Step 6 — Initialize

Start the relevant build execution when the work is ready and authorized.

This may involve Cursor, GitHub, or another executor.

## Step 7 — Execute

Implement the change.

The factory should track the execution and resulting artifacts.

## Step 8 — Verify

Establish whether the implementation actually fulfills the requirement that motivated the work.

Successful build execution is not, by itself, proof of successful product realization.

## Step 9 — Continue or escalate

If verification succeeds, the work can be recognized as fulfilled.

If it fails, the remaining discrepancy should inform further engineering work.

If progress depends on something the factory cannot resolve, the appropriate blocker should be surfaced.

This sequence captures the conceptual lifecycle.

It is not yet a locked state machine or stage list.

---

# 10. Blockers — Where Founder Intervention Belongs

Trigger should handle blockers inside the factory.

This is a major part of the envisioned operating experience.

Instead of the founder discovering problems indirectly through scattered GitHub discussions, failed Cursor sessions, or separate conversations, blockers should appear as part of the relevant work's state.

A blocker prevents progress until some required condition is satisfied.

Possible categories include:

- Missing authorization.
- Missing external access or credentials.
- A genuine unresolved product decision.
- Conflicting authoritative decisions.
- A dependency that cannot yet be satisfied.
- A technical issue the factory cannot resolve autonomously.
- A verification problem that requires additional evidence or judgment.

These are illustrative categories, not a finalized blocker model.

## 10.1 Not every blocker belongs to the founder

Trigger should attempt to resolve technical issues through its own investigation and engineering capabilities.

The founder should not become responsible for routine debugging merely because something failed.

Intervention should be reserved for matters that genuinely require the founder's authority, input, or judgment.

## 10.2 Blockers should be actionable

A blocked row should expose the specific condition preventing further progress.

The interface should provide an appropriate way to resolve it.

For example, a missing authorization is different from a missing engineering solution.

Both may stop work, but they require different responses.

Once the blocker is resolved, the factory should be capable of continuing the interrupted work.

The precise mechanism for resuming work remains to be designed.

---

# 11. The Core Quality Problem — Implementation Fidelity

The discussion identified Implementation Fidelity as one of the foundational problems motivating Trigger.

Tower's development demonstrated that detailed specifications do not automatically guarantee faithful implementation.

The original build factory already employed:

- Product Management agents.
- Systems Analyst agents.
- Detailed engineering packets.
- Canonical UI plates.
- Database and system specifications.
- Historical founder decisions.
- Explicit implementation guidance.
- Verification and test instructions.

Nevertheless, implementations sometimes diverged from what had already been decided.

This can occur even when an engineering task appears complete.

The result may compile successfully, look correct, and satisfy a limited test while violating the original product intent.

## 11.1 Definition

**Implementation Fidelity asks whether the implemented software actually fulfills the decisions that govern it.**

The problem is not necessarily insufficient specification.

The problem is preserving the relationship between a decision and its implementation through the entire development process.

## 11.2 Why packet detail alone is insufficient

A specification tells an engineer what to build.

But writing a sufficiently detailed specification does not guarantee that:

- The engineer understood it correctly.
- All relevant constraints were applied.
- Related modules remain consistent.
- The correct runtime behaviour was implemented.
- The resulting feature works under real operating conditions.
- The verification method tests the intended behaviour.

This means Implementation Fidelity requires a mechanism beyond packet generation.

## 11.3 The proposed direction

During the discussion, we proposed making requirements independently verifiable.

A requirement could be connected to:

1. The authoritative decision.
2. The implementing source mechanisms.
3. Observable acceptance conditions.
4. Verification evidence.

Where feasible, the behavioural contract should exist before implementation begins.

The engineer remains free to choose an appropriate mechanism, but the intended outcome is not redefined by the implementation attempt.

For example, if Launch is supposed to arm an Automation without executing it immediately, verification should establish that behaviour against the actual running system.

A successful compilation or a correctly labeled button is insufficient.

**The factory should not confuse work completed with behaviour fulfilled.**

The exact verification architecture remains undecided.

---

# 12. Decision Fit — The Other Governing Problem

Decision Fit is the second foundational concept.

It addresses what happens before or during the creation of an engineering solution.

A new problem may be discovered.

An agent may propose a technically reasonable solution.

But that solution must not contradict decisions already made about the product.

## 12.1 Definition

**Decision Fit asks whether a proposed change is compatible with the authoritative decisions, constraints, and intended behaviour of the existing system.**

A solution can be technically sound while being wrong for the product.

It may solve a local implementation issue by introducing an unnecessary feature, changing module authority, or weakening an established requirement.

## 12.2 Why this matters to Trigger

If Trigger autonomously creates packets, it must also know which proposals belong in the product.

Otherwise, it could efficiently implement solutions that contradict the founder's original intentions.

Decision Fit is intended to constrain autonomous decision-making.

The agent should first determine whether the problem has already been answered by existing decisions.

If the answer can be derived, it should not unnecessarily request another founder decision.

If multiple implementation mechanisms satisfy the same requirement, the agent can investigate and select an appropriate solution.

Only a genuine, consequential product silence should require new product authority.

## 12.3 Preventing unnecessary expansion

Decision Fit also applies to proposed features that seem useful but are not required.

For example, Trigger may eventually be useful across Omcoda products.

That does not authorize the initial implementation of a multi-project dashboard.

Similarly, a conventional project-management tool might offer extensive collaboration controls, but Trigger does not automatically need them.

A feature should be justified by the current product's requirements or necessary supporting operation, not merely its plausibility.

---

# 13. One Architecture Connecting Fidelity and Fit

Implementation Fidelity and Decision Fit are complementary.

They assess different directions of the same relationship.

| | Implementation Fidelity | Decision Fit |
|---|---|---|
| Main concern | Existing implementation | Proposed implementation |
| Central question | Did we build what was decided? | Does this proposal belong? |
| Direction | Decision → code → evidence | Problem → decisions → solution |
| Failure | Implementation diverges from intent | Proposal conflicts with intent |
| Outcome | Verified conformance | Compatible engineering decision |

Both require knowledge of the decisions governing a product.

This suggests an underlying decision-aware production architecture.

Such an architecture would need to recognize relevant requirements, their ownership and constraints, and their relationship to source implementations and proposed work.

The key idea is not to supply agents with endlessly increasing amounts of context.

It is to make existing decisions capable of governing what agents propose, implement, and verify.

This was the conceptual architectural direction developed in our discussion.

It has not yet been reduced to a final technical design.

---

# 14. External Research in Trigger

The recent Tower architecture-research initiative remains relevant.

Its purpose was to identify established real-world solutions to engineering problems rather than repeatedly reinvent mechanisms.

Trigger could incorporate that research function into its preparation and decision process.

When a problem is discovered, an agent may investigate:

- How Tower currently implements the relevant mechanism.
- Which product decisions govern it.
- How established software systems solve comparable problems.
- Which failure modes are known.
- Which existing libraries or implementation patterns can be reused.
- Which solution best preserves the product's requirements.

External solutions provide engineering evidence.

They do not automatically define Tower's product behaviour.

The aim is to use proven implementations to achieve already-established product requirements with compactness, cost-effectiveness, and minimal complexity.

The precise research process and degree of autonomy remain open.

---

# 15. Verification as a Continuous Production Function

A central concern is how Trigger determines that required software has actually been created.

The earlier factory could complete a packet and merge code without necessarily establishing that the intended product capability worked in full.

Trigger should aim to close that gap.

The proposed feedback cycle is:

**Required behaviour → Implementation → Verification → Remaining discrepancy → Further work**

A failed verification need not require another founder instruction.

Where the failure is sufficiently understood, it can become the basis for another packet or corrective execution.

Verification may involve multiple forms of evidence, depending on the requirement:

- Automated tests.
- Database state.
- API responses.
- Actual UI interactions.
- Integration behaviour.
- Execution history.
- Failure and recovery tests.

No single verification technique has been selected as universally sufficient.

The important direction is that **verification becomes part of production rather than an optional activity after coding**.

The factory's understanding of what remains unfinished should change when verification uncovers new evidence.

---

# 16. Founder Participation — Exception Rather Than Default

Trigger is designed to reduce the founder's involvement in routine software production.

The founder should not generally need to:

- Translate every product decision into a ticket.
- Manually author every packet.
- Assign every piece of work.
- Start every build.
- Repeatedly supply context already available to the factory.
- Diagnose every failed implementation attempt.
- Decide engineering questions already resolved by existing requirements.

However, the founder retains control.

Manual operation remains possible.

The board can expose Run where useful.

A blocked row can request a decision, authorization, credential, or other necessary intervention.

Completed work can be opened and inspected.

The product is not designed to eliminate founder authority.

It is designed to avoid unnecessarily consuming it.

**Autonomy concerns execution and derivable decisions; authority remains governed.**

---

# 17. Single-Context Operation — An Explicit Scope Boundary

A later clarification introduced an important product boundary.

Trigger may be designed for eventual reuse across multiple Omcoda products.

But this does not imply that the initial interface must support managing multiple projects.

The first iteration may operate on only one software context.

That context may be established outside Trigger's visible interface.

The initial product therefore does not inherently require:

- A multi-project dashboard.
- A project switcher.
- A project-creation workflow.
- A repository portfolio.
- Organization or workspace administration.
- Simultaneous management of several products.

Even whether the initial implementation should be architecturally modular around a project abstraction remains open.

The user explicitly allowed for a first iteration that simply operates on one existing project without making project management itself part of Trigger.

This reflects an important design principle:

**Potential future reuse does not justify additional current product functionality.**

Trigger should implement what is required for its initial operating purpose.

It should not acquire features merely because those features are conventional or conceivable.

---

# 18. Possible Relationship to Travis

The user identified conceptual similarities between Trigger and Travis.

A future integration between them was considered possible.

No specific integration, division of responsibility, shared runtime, or architectural dependency was established.

Trigger must therefore be understood independently for the initial iteration.

Its existence should not depend on first resolving how Travis might participate.

Integration remains a future possibility, not a V1 requirement.

---

# 19. The Governing Design Principle — Completeness Without Expansion

The final scope discussion introduced an important principle.

The user has a relatively complete mental image of Trigger.

The expectation is that AI should be capable of reconstructing much of the software and its necessary supporting mechanisms from the stated product behaviour.

This does not mean an agent should invent every potentially useful feature.

It means distinguishing two kinds of derivation.

## 19.1 Necessary derivation

If packets can be authorized without initiating builds, the system needs some means of representing that distinction.

If work can be blocked and subsequently continued, the system needs to preserve enough state to resume appropriately.

If completed implementations must be verified, the system needs evidence connecting results to their requirements.

These are supporting mechanisms necessary to realize existing product behaviour.

## 19.2 Unwarranted expansion

Multi-project dashboards, elaborate administration systems, unnecessary workflow editors, and broad project-management functionality do not automatically follow from the present vision.

They may be useful someday.

But usefulness alone does not make them requirements.

## 19.3 The principle

**Build everything required to realize the established product. Do not build additional product functionality merely because it is plausible.**

This principle is particularly important for an autonomous software factory.

Without it, Trigger could continuously produce work for imagined features rather than closing the distance between the intended product and its implementation.

---

# 20. What Trigger Is Not

Based on the discussion, Trigger should not currently be characterized as:

**A replacement for GitHub or Cursor.**  
These can remain the underlying source-control and execution systems.

**A conventional project-management application.**  
Its purpose is software production, not merely displaying assigned work.

**A packet generator requiring manual execution.**  
Agents are intended to author packets and initiate eligible work without routine founder involvement.

**A multi-project portfolio application.**  
The initial iteration may operate on one externally established context.

**A system where passing a build means the product requirement is satisfied.**  
Implementation Fidelity requires evidence of the intended behaviour.

**An unconstrained autonomous feature generator.**  
Decision Fit restricts work to what belongs within established product requirements and necessary supporting mechanisms.

**A large interface exposing every internal operation.**  
The envisioned interface is primarily a table with minimal context-dependent controls.

**A system dependent on Travis integration.**  
That relationship remains speculative.

---

# 21. What Has Been Decided

The following aspects of the vision are sufficiently established to preserve as product direction.

| Concern | Established direction |
|---|---|
| Name | Trigger |
| Company | Omcoda |
| Initial use | Tower software factory |
| Future utility | Other Omcoda products |
| Primary interface | Table-first board |
| Work discovery | Agent-driven |
| Packet authorship | Agent-driven |
| Authorization | Separate from authorship |
| Build initialization | Separate from packet creation |
| Automatic execution | Intended as the normal operation |
| Manual initiation | Permitted |
| Buttons | Minimal, context-dependent, potentially none |
| Blockers | Managed within Trigger |
| Build executors | Existing GitHub/Cursor infrastructure is a natural starting point |
| Decision Fit | Governs proposed decisions and implementations |
| Implementation Fidelity | Governs whether delivered software satisfies established decisions |
| Product scope | Derive necessary functionality without inventing unrelated features |
| Project interface | Multi-project management not required initially |
| Travis | Possible future integration only |

---

# 22. What Remains Undecided

The following questions have been identified but should not be prematurely answered as if they were requirements.

## Packet structure

- What constitutes one packet?
- Is Scrum-style Epic → Story → Task decomposition appropriate?
- Should the board's principal row correspond to a packet, requirement, or another work unit?
- How should larger obligations decompose into smaller independent work?

## Production stages

- What stages and phases exist?
- Which transitions are automatic?
- Which require authorization?
- Which states are visible versus internal?

## Authorization

- What may agents authorize autonomously?
- What requires founder approval?
- How is authorization represented and enforced?

## Implementation Fidelity

- How are established decisions converted into verifiable obligations?
- How are acceptance conditions produced?
- How independent should verification be from implementation?
- What evidence is sufficient to recognize completion?
- How are failed implementations retried or decomposed?

## Decision Fit

- How are current authoritative decisions identified?
- How are historical corrections and supersession handled?
- How are candidate solutions checked against governing constraints?
- How are genuine product silences distinguished from derivable decisions?

## Blockers

- What constitutes a blocker?
- When should Trigger investigate automatically?
- When should it require founder intervention?
- How should blocked work resume?

## Interface

- What are the final columns?
- What information is visible by default?
- What determines the primary button?
- How should completed and blocked rows be differentiated?
- Which secondary controls are necessary?

## Technical architecture

- What is the initial persistence model?
- How are agents and execution tools coordinated?
- How are GitHub and Cursor integrated?
- How much of the decision and conformance architecture needs to exist in V1?
- How is a single operating context established?

These are subjects for subsequent product and engineering work.

The present overview should not be mistaken for having resolved them.

---

# 23. Initial Product Boundary

The desire is to stand up Trigger as quickly as possible.

That favors avoiding features that do not directly contribute to the initial software-factory objective.

An initial Trigger should be oriented around one existing product context and the ability to:

1. Determine necessary work from established product knowledge and implementation evidence.
2. Produce bounded work packets autonomously.
3. Keep packet preparation independent of build execution.
4. Apply suitable authorization.
5. Initialize and track engineering work.
6. Identify and surface blockers that require intervention.
7. Examine whether completed work satisfies the intended product behaviour.
8. Present progress and necessary founder actions through a minimal table-first interface.

This is the conceptual initial boundary, not yet a committed V1 acceptance checklist.

Its implementation should be driven by the smallest architecture capable of making those responsibilities operational.

It should not begin by constructing a general-purpose development platform.

---

# 24. Final Product Definition

**Trigger is Omcoda's autonomous software factory.**

It begins with an established software product and its existing decisions, specifications, and implementation.

It seeks to determine what remains necessary to realize that product.

It formulates engineering work through agent-authored packets, separates packet preparation from authorization and build initialization, and carries eligible work through execution using connected development infrastructure.

It manages blockers within a minimal, table-first operating interface, involving the founder when authority or essential input is genuinely required rather than making them responsible for routine orchestration.

Its engineering direction is governed by two complementary concerns:

**Decision Fit** ensures that proposed solutions belong within the product already decided.

**Implementation Fidelity** seeks to establish that the software actually built fulfills those decisions.

The factory's objective is not merely to produce code or complete tickets.

It is to reduce the distance between **what the product is supposed to be** and **what the working software demonstrably is**.

Its initial scope is deliberately narrow: operate on one software context without unnecessarily introducing project-management functionality or future integrations.

Its long-term utility may extend across Omcoda products, but that future ambition does not expand the initial requirements.

**Trigger should be capable of producing the required software without requiring the founder to continuously manufacture and initiate the work.**

---

**End of Product Overview — October 19, 2026**

**Next stage:** Architectural and implementation planning, when separately authorized.
