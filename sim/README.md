# BitBot custom simulator scaffold

This folder is the runtime layer used by MakeCode when a custom extension includes a simulator model.

The simulator state here is intentionally minimal: it tracks wheel speed, heading, and position so the extension can animate a rover-like robot instead of the plain micro:bit board.

This is the standard custom-simulator pattern for a PXT extension and should be used alongside the block API in [main.ts](../main.ts).
