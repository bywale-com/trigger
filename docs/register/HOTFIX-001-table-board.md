# Hotfix 001 — table board

Founder, 30 Oct 2026: the board is squished on the phone and on the desktop. Use a normal table. A header. Borders. One width for a column, from the header through every cell. The board scrolls sideways so those widths can stay. A column border can move a little, and that move is the whole column.

## Cut

- `src/desk/TableView.tsx` — one bordered table at every width. Designed widths stay. A drag is clamped to 85–115% of that width. `scroll.x` is the sum of the column widths, so a narrow pane scrolls inside the board.
- `src/desk/desk.css` — the table no longer forces overflow visible. The board stays inside the pane and scrolls on x.
- Walks follow the table. `data-testid="database"` is the board on the phone and on the desktop.

## Not in this cut

Plates. Architect log. SA log. Factory controls.
