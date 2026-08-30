# BitBot Simulator

This workspace contains a lightweight BitBot simulator and a MakeCode block-style package scaffold for the 4tronix BitBot robot API.

## Included

- A browser-based robot simulator in [index.html](index.html)
- Styling and animation in [styles.css](styles.css)
- BitBot motion logic in [app.js](app.js)
- MakeCode block definitions in [main.ts](main.ts)
- PXT metadata in [pxt.json](pxt.json)

## MakeCode blocks

The custom blocks are defined with MakeCode annotations, so the package exposes block-based actions like:

```ts
bitbot.go(BBDirection.Forward, 60)
bitbot.rotate(BBRobotDirection.Left, 45)
bitbot.stop(BBStopMode.Brake)
```

This maps to the block language used by MakeCode and is closer to the 4tronix BitBot package than plain JavaScript calls.

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000

## Example block-style code

```ts
bitbot.go(BBDirection.Forward, 60)
basic.pause(1000)
bitbot.rotate(BBRobotDirection.Left, 45)
basic.pause(700)
bitbot.stop(BBStopMode.Brake)
```

## MakeCode import flow

1. Push this repo to GitHub.
2. Open MakeCode.
3. Choose Import and use the GitHub repository URL.
4. Use the block-based BitBot API from [main.ts](main.ts).

## Custom MakeCode simulator

This repo now includes a custom simulator scaffold in [sim/bitbot.ts](sim/bitbot.ts). That is the runtime layer MakeCode uses when an extension wants to render a rover-like custom board instead of the default micro:bit silhouette.

This is the part needed for a rover-like visual simulation in the MakeCode simulator, although full visual rendering still depends on the final extension build and compilation flow in the MakeCode environment.

## Notes

- The simulator is intentionally focused on motion and orientation.
- It is a good base for adding line sensors, range sensing, LEDs, and obstacle detection.
- The package is a scaffold and can grow to match the full BitBot library from the upstream 4tronix project.

## Reference

- Upstream BitBot library: https://github.com/4tronix/BitBot
- MakeCode: https://makecode.microbit.org/
