# Trigger V1 plates

The desk is Tower’s Ant Design seed, not a separate theme. Source: `omcoda_tower` `src/app/register/prototype-ant/theme.ts`. Primary `#1677ff`. Radius 6. Font size 14. Control height 32. Light uses `defaultAlgorithm`. Dark uses `darkAlgorithm`. Both are the product. The header switch is that control.

Rendered with Ant Design 6.5.3. These are plates, not a screenshot of a planted Trigger app.

The table, the full graph, and the filtered graph use a representative population so the database and the graph can be judged full. Ledger revision 1 is three pages: `exec-identity`, `pkt-001-click-attribution`, and `launch-agent`. The other pages are not records. The initiative, packet, and blocked pages are that ledger. The running page is a fixture and says so.

## Plates

- [a-table-light.png](./a-table-light.png) · [a-table-dark.png](./a-table-dark.png) — the database
- [b-graph-light.png](./b-graph-light.png) · [b-graph-dark.png](./b-graph-dark.png) — the same pages
- [g-filtered-light.png](./g-filtered-light.png) · [g-filtered-dark.png](./g-filtered-dark.png) — Type is Initiative
- [c-initiative-light.png](./c-initiative-light.png) · [c-initiative-dark.png](./c-initiative-dark.png) — `exec-identity`
- [d-packet-light.png](./d-packet-light.png) · [d-packet-dark.png](./d-packet-dark.png) — `pkt-001-click-attribution`
- [e-execution-light.png](./e-execution-light.png) · [e-execution-dark.png](./e-execution-dark.png) — a running dispatch the ledger does not contain
- [f-blocked-light.png](./f-blocked-light.png) · [f-blocked-dark.png](./f-blocked-dark.png) — Launch Agent

## How to read them

**Copy.** Ant header. Trigger, the Tower commit, Table / Graph, the light/dark switch. One small Ant table. A page icon, the name, the id under it. Type, module, stage tag, execution, evidence counts, Inside, Depends on, updated. The graph draws those same pages. A solid bracket contains. A dashed line depends on. The filter is on both views. A page is a property list, then the factory’s own sentences. An error alert holds a blocked reason. The same chrome in both modes.

**Do not build.** A second color system. Nested expandable rows. A module as a node. A packet drawn as depending on its parent. The representative pages as hardcoded rows. The sentence under the population title that explains the fill. “Representative population” and “Fixture · not ledger revision 1” as product copy. Those lines exist so a plate is not mistaken for the ledger.

**Implied.** The switch changes mode and keeps the same pages. Table / Graph changes view. The filter hides pages and the edges that used them. A row and a node open the same page.

**Out of scope.** Operator navigation, Hub, and the sider. Those are Tower’s desk, not Trigger’s.
