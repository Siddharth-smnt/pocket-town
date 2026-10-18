# Screens and navigation

## Home

The app opens on Home. Town artwork is the main visual, with the brick balance and completed places together. Play appears before the next building card so starting a puzzle stays easy to find. The next project shows available bricks against its cost and changes to “Ready to build” when affordable. The primary Play/Continue button leads to the puzzle. Best score, sound and help stay easy to find.

The warm palette and original SVG town are retained. Phones use one column; larger displays put the town beside its next project. Home can scroll when needed; the play action follows the town and never overlays another control. No puzzle board is shown here.

A small version label below the brand and in the pause menu identifies the installed build. Android's native title bar is disabled; only the web app header and normal system bars should appear.

## Puzzle

The puzzle screen contains a compact Home/pause header, score and best score, the 8×8 board, the three pieces, and Rotate/Hint/Undo. There is no town illustration, building card or ad button on this screen. The board accounts for viewport height so tools remain within reach on compact phones. Landscape uses the board on the left and pieces/tools on the right. Large text and unusually small windows may still require scrolling; content is never cropped to force a fixed height.

Restart, sound and help live in the pause menu. Restarting an unfinished scored game requires confirmation. Building availability is indicated by a small Home dot and a short inline message; it does not interrupt a move or navigate automatically. Game over provides Play again and Visit your town.

## Continuity and access

Home/Continue changes only UI state: board, tray, selected piece, score, currency and undo remain in the same GameSession. A building purchase still invalidates undo, preventing refunds. Cold launch/reload begins on Home and loads the saved game; undo remains memory-only as before. The save schema is unchanged.

Inactive screens are hidden and inert, so they are not reachable by touch, keyboard or screen readers. Screen changes move focus to the new title and reset scroll. Browser Back/Forward traverses Home and the puzzle; Android Back closes a dialog first, then returns Home, then offers to exit. Leaving cancels a drag and flushes pending saves. Background/resume keeps the current screen and game.

Action buttons have at least 44px targets, text labels and focus outlines. Reduced-motion preferences, safe-area insets and save failure warnings apply on both screens. Normal save status stays on Home; failed or protected saves remain visible during play.

Automated browser checks cover navigation and state transitions. The native emulator smoke test exercises Android Back and captures system bars; the PR records its actual result. TalkBack, physical touch dragging, font scaling and different devices/cutouts still need device acceptance testing for this version.
