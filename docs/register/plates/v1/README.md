# Trigger V1 plates

The desk is Tower’s Ant Design seed, not a separate theme. Source: `omcoda_tower` `src/app/register/prototype-ant/theme.ts`. Primary `#1677ff`. Radius 6. Font size 14. Control height 32. Light uses `defaultAlgorithm`. Dark uses `darkAlgorithm`. Both are the product. The header switch is that control.

These two are the table, from ledger revision 1. They are a first desk, rendered with Ant Design 6.5.3, not a screenshot of a planted Trigger app.

- [a-table-light.png](./a-table-light.png)
- [a-table-dark.png](./a-table-dark.png)

The graph, initiative, packet, running dispatch, blocker, and collapsed module are specified in [`V1-OBSERVABILITY-SPEC.md`](../../V1-OBSERVABILITY-SPEC.md) and are not drawn here yet. An earlier set in a paper theme was rejected.

## How to read the table

**Copy, after approval.** Ant header. Trigger, the Tower commit, ledger revision, scope. Segmented Table / Graph. The light/dark switch. Small Ant table. Module name above each table. Expandable initiative. Tags for stage. Error tag for a blocked reason. The same ledger in both modes.

**Do not build.** A second color system. A paper background. A custom table painted to look like Ant.

**Implied.** The switch changes mode and keeps the same records. Table / Graph changes view. Expanding a row shows its packets. A row opens the detail.

**Completes, no extra plate.** The other views, in both modes, once this table is the accepted system.

**Out of scope.** Operator navigation, Hub, and the sider. Those are Tower’s desk, not Trigger’s.
