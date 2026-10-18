# Gameplay and economy

Start on Home to see your town, bricks and next building. Play puzzle (or Continue puzzle) opens a dedicated board screen. Return Home whenever you want to build; navigation does not reset the board or undo. The pause menu contains New puzzle, sound and help. Only confirming New puzzle resets a live board.

Select one of three pieces and tap the top-left corner of its bounding box, or drag its preview. Rotation and hints are free. Pieces cannot overlap cells or extend beyond the 8×8 board. A fresh tray appears after all three pieces are used.

Rows and columns are detected together before clearing. Their intersection is removed once, but both lines count. Game over requires that no remaining piece fits in any rotation. Hints maximize the score across the preferred piece's rotations, then try other pieces if it has no fit.

The tutorial's blue domino fills the bottom row's two-square opening: 120 points and 3 bricks, enough for the bakery. Restarts use an empty board and do not repeat that opening.

## Rewards

- Points: `squares × 10 + lines × 100`, plus `lines × 25` when at least two lines clear.
- Bricks: `lines × 3 + max(0, lines − 1)`.
- A two-square piece clearing a row and column earns 270 points and 7 bricks.
- A completed optional native test ad grants 3 bricks. Load/show success or early dismissal alone grants nothing.

Configure the values in `src/game/config.ts`. This is an initial progression model, not a tested retention/revenue forecast.

## Town

The starter home is free. Subsequent projects unlock in order:

| Project          | Bricks |
| ---------------- | -----: |
| Corner bakery    |      3 |
| Community garden |      5 |
| Little library   |      8 |
| Town café        |     10 |
| Sunny windmill   |     12 |
| Lakeside park    |     15 |

Total cost: 53 bricks. Restarts keep buildings, remaining bricks, best score and sound. A complete town still allows puzzles and high-score play; no hidden expansion or paid content exists.

Undo restores one valid move and its currency change. It is cleared by a purchase, reward, restart or reload. Best score remains the highest reached, including a subsequently undone move.

Keyboard: Tab/Enter selects pieces; arrows navigate the board; Enter/Space places; R rotates. On phones, scroll outside the board/tray, which reserve gestures for play. There is no timer or streak penalty.
