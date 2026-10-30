# Trigger — product direction, V1

**Date:** October 29, 2026  
**Seat:** Technical Architect  
**Status:** Authoritative for V1. The Ant chrome is approved. The page-database plates correct the face of packet 001. This seat does not plant.  
**Historical record, unchanged:** [`PRODUCT-OVERVIEW.md`](./PRODUCT-OVERVIEW.md) (October 19, 2026). That file stays the original vision. It is not the build instruction.

---

## Founder wording

> Trigger is Omcoda's read-only observability interface for its software factories. Tower is its first source. Trigger displays the factory's work, state, relationships, evidence, and progress without controlling production.

The factory the October 19 overview assigned to Trigger now lives in Tower: initiative selection, investigation, specifications, packets, dispatch, verification, reconciliation, and the execution ledger. Trigger observes that machinery. It does not operate it.

Tower is the execution system. Trigger is the observability system. At least for V1.

## What V1 is

Trigger opens on one factory, Tower, and shows the records Tower already keeps.

Two views, one database of pages. The table is that database. The graph is the same pages, with the same filter. A row and a node open the same page. Inside is which page contains this one. Depends on is the other relation. A packet is not a dependency of its initiative just because it sits inside it.

The detail shows the specification, the packets, the dependencies, the verification, the blockers, and the execution evidence. It links to the authoritative record. It does not rewrite that record, and it does not author a summary the factory did not write.

Progress is evidence counted from those records. A percentage is not a progress display.

A running mark appears only when an execution record is open. A stage word such as Investigating is not that mark.

## What remains from October 19

These principles still govern the desk:

- The interface is table-first, with as few controls as the work allows.
- A row opens the work underneath it.
- The founder should not have to supervise ordinary production.
- Discovery, specification, authorization, and execution stay distinct. Trigger displays that distinction. Tower performs it.
- A build that ran is not the same thing as a requirement that was fulfilled.
- A blocker is visible on the work it belongs to.

## What V1 does not do

Trigger does not discover work, author packets, authorize them, dispatch agents, start or stop a build, write a ledger, or decide that a packet is ready. It does not add GitHub labels. It does not keep a second workflow state.

It does not become a multi-project product. A later factory should be able to feed the same desk through its own read-only adapter. V1 has one adapter, Tower, and no project switcher.

The sitting protocol stays the way this repository's seats work. It is not a second factory inside the product.

## Gate

The Ant header, the tags, and both color algorithms are approved. The founder then asked for a database of pages and a populated graph of those pages. The plates in [`plates/v1/`](./plates/v1/) are that face. Packet 001 stays `**Wake:** sa`. This seat does not plant. The Systems Analyst ascribes the read before the adapter is built.
