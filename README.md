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

## Importing a program from MakeCode

**Share link**

1. In the [MakeCode editor](https://makecode.microbit.org/), open your project and click **Share**.
2. Publish it and copy the resulting link (looks like `https://makecode.microbit.org/_xxxxxxxxxxxx`).
3. Paste the link into the **MakeCode published project link** field in the simulator and click **Load**.

**.hex file**

1. In MakeCode, click **Download** to save the compiled `.hex` file.
2. Drag that `.hex` file onto the simulator's drop zone (or use the file picker).
3. The simulator extracts the embedded source and loads it into the code editor.

Either way, the imported code is checked for unsupported API calls; any BitBot PRO blocks that aren't simulated are listed in the activity log as warnings but won't stop the rest of the program from running.

## Implemented APIs

**Motors** — `bitbot.go`, `goms`, `motor`, `move`, `movems`, `rotate`, `rotatems`, `stop`, `drive`, `driveMilliseconds`, `driveTurn`, `driveTurnMilliseconds`, `BBBias`

**BitBot PRO motors** — `bitbot.gocm`, `spinDeg`, `arc`, `arcdeg`, `steer` (approximated physics, not exact hardware timing)

**Sensors** — `bitbot.readLine`, `readLineDigital`, `readLineAnalog` (incl. `BBPLineSensor.Centre`), `readLight`, `sonar`

**Servos** — `bitbot.setTalon`, `bbSetServo`, `bb360Servo`, `bbServoDeadband`, `bbServoTrim`, `bbStopServos`

**Buzzer** — `bitbot.buzz`, `buzzTime`

**FireLeds** — `bitbot.setLedColor`, `ledClear`, `setPixelColor`, `ledRainbow`, `ledShift`, `ledRotate`

**Model** — `bitbot.select_model`, `getModel`, `BBModels`

**5×5 LED display** — `basic.showNumber`, `showString` (both scroll when longer than one character), `showIcon`, `showArrow`, `showLeds`, `clearScreen`

**Control flow** — `basic.pause`, `basic.forever`, `debug.setState`, `debug.log`

### Not simulated (BitBot PRO)

These BitBot PRO blocks are recognized but flagged as unsimulated warnings rather than implemented: `enablePID`, `wheelSensor`, `turnAngle`, `resetWheelSensors`, `lastEncoderError`, `motorTrim`, `pidConstants`, `carryForwardErrors`, `clearPidErrors`, `stopThreshold`, `setStartPWM`, `mergeLinePosition`, `setThreshold`, `calibrateLine`, `batteryVoltage`, `setVolume`, `onIREvent`, `irKey`, `lastIRCode`, `irKeyCode`.

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
