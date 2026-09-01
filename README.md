# BitBot Simulator

A lightweight, browser-based simulator for the 4tronix BitBot robot API.

## Included

- A browser-based robot simulator in [index.html](index.html)
- Styling and animation in [styles.css](styles.css)
- BitBot motion logic and API shim in [app.js](app.js)
- Maze generation in [maze-generator.js](maze-generator.js)
- The line-follow navigation algorithm in [navigation-algorithm.js](navigation-algorithm.js)
- Sample solutions in [solutions/](solutions)

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000

You can drag a downloaded MakeCode `.hex` file onto the simulator, or paste a published MakeCode share link such as `https://makecode.microbit.org/_JFrRw5Rcc6fJ` and select **Load**. The simulator retrieves the published project's `main.ts` and imports it into the code editor.

## GitHub Pages

Pushing to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which publishes the repository root as a static site via GitHub Pages. Enable it once under the repo's **Settings → Pages → Source: GitHub Actions**.

## Example code

```ts
bitbot.go(BBDirection.Forward, 60)
basic.pause(1000)
bitbot.rotate(BBRobotDirection.Left, 45)
basic.pause(700)
bitbot.stop(BBStopMode.Brake)
```

## Notes

- The simulator is intentionally focused on motion and orientation.
- It is a good base for adding line sensors, range sensing, LEDs, and obstacle detection.
- The package is a scaffold and can grow to match the full BitBot library from the upstream 4tronix project.

## Reference

- Upstream BitBot library: https://github.com/4tronix/BitBot
- MakeCode: https://makecode.microbit.org/
