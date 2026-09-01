const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');
const speedReadout = document.getElementById('speedReadout');
const headingReadout = document.getElementById('headingReadout');
const distanceReadout = document.getElementById('distanceReadout');
const lineReadout = document.getElementById('lineReadout');
const challengeReadout = document.getElementById('challengeReadout');
const ledGrid = document.getElementById('ledGrid');
const simulationSpeedControl = document.getElementById('simulationSpeed');
const simulationSpeedValue = document.getElementById('simulationSpeedValue');
const mazeSeedControl = document.getElementById('mazeSeed');
const debugReadout = document.getElementById('debugReadout');
const codeEditor = document.getElementById('codeEditor');
const codeHighlight = document.getElementById('codeHighlight');
const hexDropZone = document.getElementById('hexDropZone');
const hexFileInput = document.getElementById('hexFileInput');
const hexDropLabel = document.getElementById('hexDropLabel');
const hexImportStatus = document.getElementById('hexImportStatus');

const arenaSize = 520;
const robotRadius = 11;
const robotStart = { x: arenaSize / 2, y: arenaSize / 2, heading: 0, leftMotor: 0, rightMotor: 0 };

const robot = { ...robotStart, distance: 0 };
const tapeWidth = 16;
const lineSensorReach = tapeWidth / 2 + 6;
const tapeCollisionReach = 0;
const goalRadius = 26;
let tapeSegments = [];
let goal = { x: arenaSize / 2, y: arenaSize / 2 };
let mazeStart = { x: 70, y: 70 };
let mazeSeed = Number(mazeSeedControl.value) || 35;
let lastAnimationTime = performance.now();
let simulationSpeed = 1;
let simulationTime = 0;
let runTimers = [];
let pauseWaiters = [];
let challengeComplete = false;
let debugState = 'Ready';
let debugEvents = [];
let wallContact = false;
let currentSensorReadings = 'n/a';
let previousSensorReadings = 'n/a';
let lastCommand = { label: 'Stopped', at: 0 };
let lastCollision = 'None';
let robotTrail = [];
let ledPixels = Array(25).fill(false);
let fireLedPixels = Array(12).fill(0);
let selectedModel = 0;
let motorBias = { left: 0, right: 0 };
let buzzerOn = false;
let servoPositions = { P1: null, P2: null, Talon: null };
let servoDeadband = 2;
let servoTrim = { P1: 0, P2: 0 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeHeading = (deg) => {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized;
};

const BBDirection = {
  Forward: 0,
  Reverse: 1
};

const BBRobotDirection = {
  Left: 0,
  Right: 1
};

const BBMotor = {
  Left: 0,
  Right: 1,
  Both: 2
};

const BBStopMode = {
  Coast: 0,
  Brake: 1
};

const BBLineSensor = {
  Left: 0,
  Right: 1
};

const BBPLineSensor = {
  Left: 0,
  Right: 1,
  Centre: 2
};

const BBArcDirection = {
  ForwardLeft: 0,
  ForwardRight: 1,
  ReverseLeft: 2,
  ReverseRight: 3
};

const BBLightSensor = {
  Left: 0,
  Right: 1
};

const BBPingUnit = {
  Centimeters: 0,
  Inches: 1,
  MicroSeconds: 2
};

const BBServos = {
  P1: 0,
  P2: 1
};

const BBArms = {
  Both: 0,
  Left: 1,
  Right: 2
};

const BBMode = {
  Manual: 0,
  Auto: 1
};

const BBModel = {
  Classic: 0,
  XL: 1,
  Auto: 3
};

const BBColors = {
  Red: 0xff0000,
  Orange: 0xffa500,
  Green: 0x00ff00,
  Blue: 0x0000ff,
  Yellow: 0xffff00,
  Indigo: 0x4b0082,
  Violet: 0x8a2be2,
  Purple: 0xff00ff,
  White: 0xffffff,
  Black: 0x000000
};

const IconNames = {
  Heart: 'Heart',
  SmallHeart: 'SmallHeart',
  Happy: 'Happy',
  Sad: 'Sad',
  Yes: 'Yes',
  No: 'No',
  Square: 'Square',
  Diamond: 'Diamond'
};

const ArrowNames = {
  North: 'North',
  NorthEast: 'NorthEast',
  East: 'East',
  SouthEast: 'SouthEast',
  South: 'South',
  SouthWest: 'SouthWest',
  West: 'West',
  NorthWest: 'NorthWest'
};

const ledPatterns = {
  Heart: ['.###.', '#####', '#####', '.###.', '..#..'],
  SmallHeart: ['.....', '.#.#.', '.###.', '..#..', '.....'],
  Happy: ['.....', '#.#.#', '.....', '#...#', '.###.'],
  Sad: ['.....', '#.#.#', '.....', '.###.', '#...#'],
  Yes: ['....#', '...#.', '#.#..', '.#...', '#....'],
  No: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Square: ['#####', '#...#', '#...#', '#...#', '#####'],
  Diamond: ['..#..', '.#.#.', '#...#', '.#.#.', '..#..'],
  North: ['..#..', '.###.', '#.#.#', '..#..', '..#..'],
  NorthEast: ['...##', '...##', '..#.#', '.#...', '#####'],
  East: ['..#..', '...#.', '#####', '...#.', '..#..'],
  SouthEast: ['#####', '.#...', '..#.#', '...##', '...##'],
  South: ['..#..', '..#..', '#.#.#', '.###.', '..#..'],
  SouthWest: ['#####', '...#.', '#.#..', '##...', '##...'],
  West: ['..#..', '.#...', '#####', '.#...', '..#..'],
  NorthWest: ['##...', '##...', '#.#..', '...#.', '#####']
};

const characterPatterns = {
  '0': ['.###.', '#...#', '#...#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '...#.', '..#..', '#####'],
  '3': ['####.', '....#', '..##.', '....#', '####.'],
  '4': ['#..#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '####.'],
  '6': ['.###.', '#....', '####.', '#...#', '.###.'],
  '7': ['#####', '...#.', '..#..', '.#...', '.#...'],
  '8': ['.###.', '#...#', '.###.', '#...#', '.###.'],
  '9': ['.###.', '#...#', '.####', '....#', '.###.'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....'],
  G: ['.####', '#....', '#.###', '#...#', '.###.'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '###..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'],
  Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'],
  Z: ['#####', '...#.', '..#..', '.#...', '#####']
};

function renderLedGrid() {
  ledGrid.querySelectorAll('.led-pixel').forEach((pixel, index) => {
    pixel.classList.toggle('is-lit', ledPixels[index]);
  });
}

function showLedPattern(pattern, label = '5 by 5 LED display') {
  ledPixels = pattern.flatMap((row) => [...row.padEnd(5, '.').slice(0, 5)].map((pixel) => pixel === '#' || pixel === '1'));
  ledGrid.setAttribute('aria-label', label);
  renderLedGrid();
}

function showLedCharacter(value) {
  const text = String(value);
  const character = text.trim().charAt(0).toUpperCase();
  showLedPattern(characterPatterns[character] || ['.....', '.....', '..#..', '.....', '.....'], text || 'Blank LED display');
}

let ledDisplayGeneration = 0;
let ledActiveRequest = null;

function nextLedGeneration() {
  ledDisplayGeneration += 1;
  ledActiveRequest = null;
  return ledDisplayGeneration;
}

function characterColumns(character) {
  const pattern = characterPatterns[character.toUpperCase()] || ['.....', '.....', '.....', '.....', '.....'];
  return [0, 1, 2, 3, 4].map((column) => pattern.map((row) => row[column] === '#' || row[column] === '1'));
}

function scrollColumnsForText(text) {
  const blankColumn = [false, false, false, false, false];
  const columns = [];
  [...text].forEach((character, index) => {
    if (index > 0) columns.push(blankColumn);
    columns.push(...characterColumns(character));
  });
  return columns;
}

function scrollFramesForText(text) {
  const blankColumn = [false, false, false, false, false];
  const padding = Array.from({ length: 5 }, () => blankColumn);
  const columns = [...padding, ...scrollColumnsForText(text), ...padding];
  const frames = [];
  for (let start = 0; start <= columns.length - 5; start++) {
    const windowColumns = columns.slice(start, start + 5);
    frames.push([0, 1, 2, 3, 4].map((row) => windowColumns.map((column) => (column[row] ? '#' : '.')).join('')));
  }
  return frames;
}

async function scrollLedText(value) {
  const text = String(value);
  const key = `text:${text}`;
  if (ledActiveRequest && ledActiveRequest.key === key) return ledActiveRequest.promise;

  const generation = nextLedGeneration();
  const request = { key, generation, promise: null };
  request.promise = (async () => {
    if (text.length <= 1) {
      showLedCharacter(text);
    } else {
      for (const frame of scrollFramesForText(text)) {
        if (generation !== ledDisplayGeneration) return;
        showLedPattern(frame, `Scrolling: ${text}`);
        await basic.pause(120);
      }
      if (generation === ledDisplayGeneration) showLedPattern(['.....', '.....', '.....', '.....', '.....'], 'Blank LED display');
    }
    // Let the next identical call start a fresh loop instead of being treated as a duplicate.
    if (ledActiveRequest === request) ledActiveRequest = null;
  })();
  ledActiveRequest = request;
  return request.promise;
}

for (let index = 0; index < 25; index++) {
  const pixel = document.createElement('span');
  pixel.className = 'led-pixel';
  ledGrid.append(pixel);
}

const basic = {
  pause: (ms) => new Promise((resolve) => {
    pauseWaiters.push({ until: simulationTime + Math.max(0, Number(ms) || 0), resolve });
  }),
  forever: (handler) => {
    const loop = { cancelled: false, timer: null };
    const run = async () => {
      if (loop.cancelled) return;
      await handler();
      if (!loop.cancelled) loop.timer = setTimeout(run, 20);
    };
    loop.timer = setTimeout(run, 0);
    runTimers.push(loop);
    return loop;
  },
  showNumber(value) {
    return scrollLedText(value);
  },
  showString(text) {
    return scrollLedText(text);
  },
  showIcon(icon) {
    nextLedGeneration();
    showLedPattern(ledPatterns[icon] || ledPatterns.Square, `${icon} icon`);
  },
  showArrow(arrow) {
    nextLedGeneration();
    showLedPattern(ledPatterns[arrow] || ledPatterns.North, `${arrow} arrow`);
  },
  showLeds(leds) {
    nextLedGeneration();
    const pattern = String(leds).trim().split(/\r?\n/).slice(0, 5).map((row) => row.replace(/\s/g, ''));
    showLedPattern(pattern, 'Custom 5 by 5 LED display');
  },
  clearScreen() {
    nextLedGeneration();
    showLedPattern(['.....', '.....', '.....', '.....', '.....'], 'Blank LED display');
  }
};

function resolvePausedTasks() {
  const ready = pauseWaiters.filter((waiter) => waiter.until <= simulationTime);
  pauseWaiters = pauseWaiters.filter((waiter) => waiter.until > simulationTime);
  ready.forEach((waiter) => waiter.resolve());
}

function compileMakeCodeScript(script) {
  return script
    .replace(/basic\.forever\(\s*(?!async\b)(function\b)/g, 'basic.forever(async $1')
    .replace(/basic\.forever\(\s*(?!async\b)(\([^)]*\)\s*=>)/g, 'basic.forever(async $1')
    .replace(/(?<!await\s)bitbot\.(goms|rotatems|movems|buzzTime|driveMilliseconds|driveTurnMilliseconds)\s*\(/g, 'await bitbot.$1(')
    .replace(/(?<!await\s)basic\.pause\s*\(/g, 'await basic.pause(');
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCodeHighlight() {
  const keywords = new Set(['let', 'const', 'var', 'if', 'else', 'async', 'await', 'function', 'return', 'true', 'false']);
  const apis = new Set(['basic', 'bitbot', 'input', 'debug', 'NavigationAlgorithm', 'BBDirection', 'BBRobotDirection', 'BBMotor', 'BBStopMode', 'BBLineSensor', 'BBPLineSensor', 'BBArcDirection', 'BBLightSensor', 'BBColors', 'IconNames', 'ArrowNames']);
  const tokens = /\/\/[^\n]*|"[^"\n]*"|'[^'\n]*'|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b/g;
  let cursor = 0;
  let html = '';
  for (const match of codeEditor.value.matchAll(tokens)) {
    const token = match[0];
    html += escapeHtml(codeEditor.value.slice(cursor, match.index));
    const className = token.startsWith('//') || token.startsWith('"') || token.startsWith("'")
      ? 'code-string'
      : keywords.has(token) ? 'code-keyword'
        : apis.has(token) ? 'code-api'
          : /^\d/.test(token) ? 'code-number' : '';
    html += className ? `<span class="${className}">${escapeHtml(token)}</span>` : escapeHtml(token);
    cursor = match.index + token.length;
  }
  codeHighlight.innerHTML = html + escapeHtml(codeEditor.value.slice(cursor));
}

const input = {
  runningTime: () => Math.round(simulationTime)
};

function renderDebug() {
  debugReadout.innerHTML = debugEvents
    .map((entry) => `<span class="${entry.className || ''}">${escapeHtml(entry.text)}</span>`)
    .join('\n');
  debugReadout.scrollTop = debugReadout.scrollHeight;
}

function updateSensorHistory() {
  const readings = `${lineSensorValue(BBLineSensor.Left)} / ${lineSensorValue(BBLineSensor.Right)}`;
  if (readings !== currentSensorReadings) {
    previousSensorReadings = currentSensorReadings;
    currentSensorReadings = readings;
  }
  return readings;
}

function updateCommandHistory() {
  const left = Math.round(robot.leftMotor);
  const right = Math.round(robot.rightMotor);
  let label = 'Stopped';
  if (!left && !right) label = 'Stopped';
  else if (left === right && left > 0) label = `Forward ${left}`;
  else if (left === right && left < 0) label = `Reverse ${Math.abs(left)}`;
  else if (left === -right) label = left > 0 ? `Turn left ${left}` : `Turn right ${right}`;
  else if (left || right) label = `Steer ${left} / ${right}`;
  if (label !== lastCommand.label) lastCommand = { label, at: simulationTime };
}

function recordDebug(message, className = '') {
  debugEvents.push({ text: `${String(Math.round(simulationTime)).padStart(6, ' ')} ms  ${message}`, className });
  debugEvents = debugEvents.slice(-250);
  renderDebug();
}

const debug = {
  setState(state) {
    if (state === debugState) return;
    const previousState = debugState;
    debugState = state;
    recordDebug(`${previousState} -> ${state}`);
  },
  log(message) {
    recordDebug(message, 'log-debug');
  }
};

function formatApiArgument(value) {
  if (typeof value === 'function') return 'handler';
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function logApiCalls(namespace, api) {
  Object.entries(api).forEach(([name, implementation]) => {
    if (typeof implementation !== 'function') return;
    api[name] = function (...args) {
      if (!(namespace === 'input' && name === 'runningTime')) {
        if (namespace === 'basic' && (name === 'showString' || name === 'showNumber')) {
          recordDebug(String(args[0]), 'log-show-string');
        } else {
          recordDebug(`${namespace}.${name}(${args.map(formatApiArgument).join(', ')})`);
        }
      }
      return implementation.apply(this, args);
    };
  });
}

function resumeAfterWallContact() {
  if (challengeReadout.textContent === 'Wall contact') challengeReadout.textContent = 'Running';
}

function createMaze() {
  const maze = MazeGenerator.createMaze(mazeSeed);
  tapeSegments = maze.segments;
  mazeStart = maze.start;
  goal = maze.goal;
  robotStart.x = maze.start.x;
  robotStart.y = maze.start.y;
  robotStart.heading = maze.start.heading;
}

function distanceToTape(point) {
  return nearestTapeSegment(point).distance;
}

function nearestTapeSegment(point) {
  return tapeSegments.reduce((nearest, segment, index) => {
    const deltaX = segment.to.x - segment.from.x;
    const deltaY = segment.to.y - segment.from.y;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;
    const progress = clamp(((point.x - segment.from.x) * deltaX + (point.y - segment.from.y) * deltaY) / lengthSquared, 0, 1);
    const closestX = segment.from.x + progress * deltaX;
    const closestY = segment.from.y + progress * deltaY;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);
    return distance < nearest.distance ? { distance, index, x: closestX, y: closestY } : nearest;
  }, { distance: Infinity, index: -1, x: 0, y: 0 });
}

function firstTapeCrossing(from, to) {
  const moveX = to.x - from.x;
  const moveY = to.y - from.y;
  return tapeSegments.reduce((first, segment, index) => {
    if (first) return first;
    const tapeX = segment.to.x - segment.from.x;
    const tapeY = segment.to.y - segment.from.y;
    const denominator = moveX * tapeY - moveY * tapeX;
    if (Math.abs(denominator) < 0.000001) return null;
    const originX = segment.from.x - from.x;
    const originY = segment.from.y - from.y;
    const moveProgress = (originX * tapeY - originY * tapeX) / denominator;
    const tapeProgress = (originX * moveY - originY * moveX) / denominator;
    if (moveProgress <= 0 || moveProgress > 1 || tapeProgress < 0 || tapeProgress > 1) return null;
    return { index, x: from.x + moveX * moveProgress, y: from.y + moveY * moveProgress, distance: 0 };
  }, null);
}

function slideAlongTape(current, next) {
  const nextContact = firstTapeCrossing(current, next) || nearestTapeSegment(next);
  if (nextContact.distance > tapeCollisionReach) return { point: next, contact: null };

  const segment = tapeSegments[nextContact.index];
  const segmentX = segment.to.x - segment.from.x;
  const segmentY = segment.to.y - segment.from.y;
  const segmentLength = Math.hypot(segmentX, segmentY);
  const tangentX = segmentX / segmentLength;
  const tangentY = segmentY / segmentLength;
  const moveX = next.x - current.x;
  const moveY = next.y - current.y;
  const projectedDistance = moveX * tangentX + moveY * tangentY;
  let point = { x: current.x + tangentX * projectedDistance, y: current.y + tangentY * projectedDistance };
  const slideContact = nearestTapeSegment(point);
  if (slideContact.distance < tapeCollisionReach) {
    const currentContact = nearestTapeSegment(current);
    const normalLength = Math.hypot(current.x - currentContact.x, current.y - currentContact.y) || 1;
    point = {
      x: slideContact.x + (current.x - currentContact.x) / normalLength * (tapeCollisionReach + 0.1),
      y: slideContact.y + (current.y - currentContact.y) / normalLength * (tapeCollisionReach + 0.1)
    };
  }
  return { point, contact: nextContact };
}

function lineSensorPoint(side) {
  const radians = robot.heading * Math.PI / 180;
  const forward = 11;
  return {
    x: robot.x + Math.cos(radians) * forward - Math.sin(radians) * side,
    y: robot.y + Math.sin(radians) * forward + Math.cos(radians) * side
  };
}

function lineSensorValue(sensor) {
  const side = sensor === BBLineSensor.Left ? -6.5 : 6.5;
  return distanceToTape(lineSensorPoint(side)) <= lineSensorReach ? 0 : 1;
}

function proLineSensorSide(sensor) {
  if (sensor === BBPLineSensor.Left) return -6.5;
  if (sensor === BBPLineSensor.Right) return 6.5;
  return 0;
}

function readLineDigitalValue(sensor) {
  return distanceToTape(lineSensorPoint(proLineSensorSide(sensor))) <= lineSensorReach;
}

function readLineAnalogValue(sensor) {
  const distance = distanceToTape(lineSensorPoint(proLineSensorSide(sensor)));
  return clamp(Math.round((distance - tapeWidth / 2) * 60), 0, 1023);
}

function motorSpeed(speed) {
  const value = Number(speed) || 0;
  return clamp(Math.round(Math.abs(value) > 100 ? value / 10.23 : value), -100, 100);
}

function biasedSpeed(speed, motor) {
  const bias = motor === BBMotor.Left ? motorBias.left : motorBias.right;
  return speed * (100 - bias) / 100;
}

function setFireLeds(color) {
  fireLedPixels.fill(Number(color) >>> 0);
  drawArena();
}

function sonarDistance(unit) {
  const heading = robot.heading * Math.PI / 180;
  const farPoint = {
    x: robot.x + Math.cos(heading) * arenaSize,
    y: robot.y + Math.sin(heading) * arenaSize
  };
  const crossing = firstTapeCrossing(robot, farPoint);
  const edgeDistance = Math.min(
    Math.cos(heading) > 0 ? (arenaSize - robot.x) / Math.cos(heading) : Math.cos(heading) < 0 ? -robot.x / Math.cos(heading) : Infinity,
    Math.sin(heading) > 0 ? (arenaSize - robot.y) / Math.sin(heading) : Math.sin(heading) < 0 ? -robot.y / Math.sin(heading) : Infinity
  );
  const distance = crossing ? Math.hypot(crossing.x - robot.x, crossing.y - robot.y) : edgeDistance;
  if (unit === BBPingUnit.Inches) return Math.round(distance / 2.54);
  if (unit === BBPingUnit.MicroSeconds) return Math.round(distance * 59);
  return Math.round(distance);
}

const wheelBaseCm = 11;

// Smaller radius means a tighter (bigger) speed differential between the wheels.
function arcTurnFactor(radius) {
  return clamp(wheelBaseCm / (2 * Math.max(Number(radius) || 0, 1)), 0.05, 0.9);
}

function arcMotorSpeeds(direction, speed, radius) {
  const safeSpeed = Math.abs(motorSpeed(speed));
  const diff = arcTurnFactor(radius);
  const reverse = direction === BBArcDirection.ReverseLeft || direction === BBArcDirection.ReverseRight;
  const turnLeft = direction === BBArcDirection.ForwardLeft || direction === BBArcDirection.ReverseLeft;
  const dirSign = reverse ? -1 : 1;
  const innerSpeed = motorSpeed(dirSign * safeSpeed * (1 - diff));
  const outerSpeed = motorSpeed(dirSign * safeSpeed * (1 + diff));
  return turnLeft ? { left: innerSpeed, right: outerSpeed } : { left: outerSpeed, right: innerSpeed };
}

// Rates approximate the cm/deg-per-ms scale already used by updateMovement.
function driveDurationMs(distanceCm, speed) {
  const rate = Math.max(Math.abs(motorSpeed(speed)), 1) * 0.0091;
  return Math.max(Math.round(Math.abs(Number(distanceCm) || 0) / rate), 0);
}

function spinDurationMs(angleDeg, speed) {
  const rate = Math.max(Math.abs(motorSpeed(speed)), 1) * 0.0032;
  return Math.max(Math.round(Math.abs(Number(angleDeg) || 0) / rate), 0);
}

function arcDurationMs(angleDeg, speed, radius) {
  const rate = Math.max(Math.abs(motorSpeed(speed)), 1) * 0.0032 * arcTurnFactor(radius);
  return Math.max(Math.round(Math.abs(Number(angleDeg) || 0) / rate), 0);
}

const bitbot = {
  state: { ...robotStart },

  select_model(model) {
    selectedModel = Object.values(BBModel).includes(model) ? model : BBModel.Classic;
  },
  getModel() { return selectedModel === BBModel.Auto ? BBModel.Classic : selectedModel; },
  BBModels(model) { return model; },
  go(direction, speed) {
    const safeSpeed = motorSpeed(speed);
    const dir = direction === BBDirection.Forward ? 1 : -1;
    robot.leftMotor = biasedSpeed(safeSpeed * dir, BBMotor.Left);
    robot.rightMotor = biasedSpeed(safeSpeed * dir, BBMotor.Right);
    resumeAfterWallContact();
  },
  async goms(direction, speed, milliseconds) {
    this.go(direction, speed);
    await basic.pause(milliseconds);
    this.stop(BBStopMode.Coast);
  },
  motor(motor, speed) {
    const safeSpeed = motorSpeed(speed);
    if (motor === BBMotor.Left || motor === BBMotor.Both) robot.leftMotor = safeSpeed;
    if (motor === BBMotor.Right || motor === BBMotor.Both) robot.rightMotor = safeSpeed;
    resumeAfterWallContact();
  },
  move(motor, direction, speed) {
    const safeSpeed = Math.abs(motorSpeed(speed));
    const dir = direction === BBDirection.Forward ? 1 : -1;
    if (motor === BBMotor.Left || motor === BBMotor.Both) robot.leftMotor = biasedSpeed(safeSpeed * dir, BBMotor.Left);
    if (motor === BBMotor.Right || motor === BBMotor.Both) robot.rightMotor = biasedSpeed(safeSpeed * dir, BBMotor.Right);
    resumeAfterWallContact();
  },
  async movems(motor, direction, speed, milliseconds) {
    this.move(motor, direction, speed);
    await basic.pause(milliseconds);
    this.stop(BBStopMode.Coast);
  },
  rotate(direction, speed) {
    const safeSpeed = Math.abs(motorSpeed(speed));
    const left = direction === BBRobotDirection.Left ? safeSpeed : -safeSpeed;
    const right = direction === BBRobotDirection.Left ? -safeSpeed : safeSpeed;
    robot.leftMotor = left;
    robot.rightMotor = right;
    resumeAfterWallContact();
  },
  async rotatems(direction, speed, milliseconds) {
    this.rotate(direction, speed);
    await basic.pause(milliseconds);
    this.stop(BBStopMode.Coast);
  },
  async gocm(direction, speed, distance) {
    this.go(direction, speed);
    await basic.pause(driveDurationMs(distance, speed));
    this.stop(BBStopMode.Brake);
  },
  async spinDeg(direction, speed, angle) {
    this.rotate(direction, speed);
    await basic.pause(spinDurationMs(angle, speed));
    this.stop(BBStopMode.Brake);
  },
  arc(direction, speed, radius) {
    const speeds = arcMotorSpeeds(direction, speed, radius);
    robot.leftMotor = speeds.left;
    robot.rightMotor = speeds.right;
    resumeAfterWallContact();
  },
  async arcdeg(direction, speed, radius, angle) {
    this.arc(direction, speed, radius);
    await basic.pause(arcDurationMs(angle, speed, radius));
    this.stop(BBStopMode.Brake);
  },
  steer(direction, speed) {
    const safeSpeed = clamp(Number(speed) || 0, 0, 100);
    const dir = clamp(Number(direction) || 0, -100, 100);
    robot.leftMotor = motorSpeed(dir > 0 ? safeSpeed : ((100 + dir) * safeSpeed) / 100);
    robot.rightMotor = motorSpeed(dir < 0 ? safeSpeed : ((100 - dir) * safeSpeed) / 100);
    resumeAfterWallContact();
  },
  stop(mode) {
    robot.leftMotor = 0;
    robot.rightMotor = 0;
    if (mode === BBStopMode.Brake) {
      robot.heading = normalizeHeading(robot.heading);
    }
  },
  BBBias(direction, bias) {
    const value = clamp(Number(bias) || 0, 0, 80);
    motorBias = direction === BBRobotDirection.Left ? { left: 0, right: value } : { left: value, right: 0 };
  },
  drive(speed) {
    this.motor(BBMotor.Both, speed);
  },
  async driveMilliseconds(speed, milliseconds) {
    this.drive(speed);
    await basic.pause(milliseconds);
    this.stop(BBStopMode.Coast);
  },
  driveTurn(direction, speed) {
    this.rotate(direction, speed);
  },
  async driveTurnMilliseconds(direction, speed, milliseconds) {
    this.driveTurn(direction, speed);
    await basic.pause(milliseconds);
    this.stop(BBStopMode.Coast);
  },
  buzz(on) {
    buzzerOn = Boolean(on);
    debug.log(`Buzzer ${buzzerOn ? 'on' : 'off'}`);
  },
  async buzzTime(milliseconds) {
    this.buzz(true);
    await basic.pause(milliseconds);
    this.buzz(false);
  },
  readLine(sensor) {
    return lineSensorValue(sensor);
  },
  readLineDigital(sensor) {
    return readLineDigitalValue(sensor);
  },
  readLineAnalog(sensor) {
    return readLineAnalogValue(sensor);
  },
  readLight(sensor) {
    const offset = sensor === BBLightSensor.Left ? -15 : 15;
    return Math.round(clamp(650 - Math.abs(robot.x - arenaSize / 2) - Math.abs(robot.y - arenaSize / 2) + offset, 0, 1023));
  },
  sonar(unit = BBPingUnit.Centimeters) {
    return sonarDistance(unit);
  },
  setTalon(degrees) {
    servoPositions.Talon = clamp(Number(degrees) || 0, 0, 80);
  },
  bbSetServo(servo, degrees) {
    servoPositions[servo === BBServos.P1 ? 'P1' : 'P2'] = clamp(Number(degrees) || 0, 0, 180);
  },
  bb360Servo(servo, direction, speed) {
    const name = servo === BBServos.P1 ? 'P1' : 'P2';
    const rotation = Math.abs(motorSpeed(speed)) <= servoDeadband ? 90 : 90 + (direction === BBDirection.Forward ? 1 : -1) * Math.abs(motorSpeed(speed)) * 0.9;
    servoPositions[name] = clamp(rotation - servoTrim[name], 0, 180);
  },
  bbServoDeadband(deadband) {
    servoDeadband = clamp(Number(deadband) || 0, 0, 5);
  },
  bbServoTrim(servo, trim) {
    servoTrim[servo === BBServos.P1 ? 'P1' : 'P2'] = clamp(Number(trim) || 0, 0, 50);
  },
  bbStopServos() {
    servoPositions = { P1: null, P2: null, Talon: null };
  },
  setLedColor(color) { setFireLeds(color); },
  ledClear() { setFireLeds(0); },
  setPixelColor(pixel, color) {
    const index = clamp(Math.round(pixel), 0, fireLedPixels.length - 1);
    fireLedPixels[index] = Number(color) >>> 0;
    drawArena();
  },
  ledRainbow() {
    fireLedPixels = Array.from({ length: 12 }, (_, index) => `hsl(${index * 30} 90% 58%)`);
    drawArena();
  },
  ledShift() {
    fireLedPixels = [0, ...fireLedPixels.slice(0, -1)];
    drawArena();
  },
  ledRotate() {
    fireLedPixels = [fireLedPixels.at(-1), ...fireLedPixels.slice(0, -1)];
    drawArena();
  }
};

logApiCalls('basic', basic);
logApiCalls('input', input);
logApiCalls('bitbot', bitbot);

function updateMovement(deltaMs = 20) {
  const left = robot.leftMotor / 100;
  const right = robot.rightMotor / 100;
  const turnRate = (right - left) * 0.8;
  const elapsed = deltaMs / 20 * simulationSpeed;
  simulationTime += deltaMs * simulationSpeed;
  resolvePausedTasks();
  robot.heading = normalizeHeading(robot.heading + turnRate * 4 * elapsed);

  const speedFactor = ((left + right) / 2) * 1.3;
  const radians = robot.heading * (Math.PI / 180);
  const step = speedFactor * 1.4;
  const edgeInset = robotRadius + 10;
  const nextX = robot.x + Math.cos(radians) * step * 2.2 * elapsed;
  const nextY = robot.y + Math.sin(radians) * step * 2.2 * elapsed;
  const hitEdge = nextX <= edgeInset || nextX >= arenaSize - edgeInset || nextY <= edgeInset || nextY >= arenaSize - edgeInset;
  const isTranslating = Math.abs(step) > 0.0001;
  const tapeMove = isTranslating ? slideAlongTape(robot, { x: nextX, y: nextY }) : { point: { x: nextX, y: nextY }, contact: null };
  const hitWall = Boolean(tapeMove.contact);

  robot.x = clamp(tapeMove.point.x, edgeInset, arenaSize - edgeInset);
  robot.y = clamp(tapeMove.point.y, edgeInset, arenaSize - edgeInset);
  robot.distance += Math.abs(step * 10 * elapsed);
  if (isTranslating) {
    robotTrail.push({ x: robot.x, y: robot.y });
    robotTrail = robotTrail.slice(-1800);
  }
  if (!hitWall) wallContact = false;

  const overallSpeed = Math.abs((robot.leftMotor + robot.rightMotor) / 2);
  speedReadout.textContent = String(Math.round(overallSpeed));
  headingReadout.textContent = `${Math.round(robot.heading)}°`;
  distanceReadout.textContent = `${Math.round(robot.distance)} cm`;
  lineReadout.textContent = updateSensorHistory();

  if (!challengeComplete && Math.hypot(robot.x - goal.x, robot.y - goal.y) <= goalRadius) {
    challengeComplete = true;
    challengeReadout.textContent = 'Success';
    lastCollision = 'None';
    debug.setState('Goal reached');
    stopSimulation();
  } else if (hitEdge) {
    challengeReadout.textContent = 'Edge hit';
    lastCollision = `Arena edge near ${Math.round(nextX)}, ${Math.round(nextY)}`;
    debug.setState('Edge collision');
    stopSimulation();
  } else if (hitWall) {
    lastCollision = `Tape ${tapeMove.contact.index + 1} at ${Math.round(tapeMove.contact.x)}, ${Math.round(tapeMove.contact.y)}`;
    if (!wallContact) debug.setState('Tape contact - sliding');
    wallContact = true;
  }

  renderDebug();
  drawArena();
}

function drawArena() {
  ctx.clearRect(0, 0, arenaSize, arenaSize);

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, arenaSize, arenaSize);

  ctx.strokeStyle = '#f7f7f2';
  ctx.lineWidth = tapeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  tapeSegments.forEach((segment) => {
    ctx.moveTo(segment.from.x, segment.from.y);
    ctx.lineTo(segment.to.x, segment.to.y);
  });
  ctx.stroke();

  if (robotTrail.length > 1) {
    ctx.strokeStyle = 'rgba(93, 173, 226, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    robotTrail.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(mazeStart.x, mazeStart.y, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = challengeComplete ? '#58d68d' : '#f5b041';
  ctx.beginPath();
  ctx.arc(goal.x, goal.y, goalRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', goal.x, goal.y + 4);

  ctx.save();
  ctx.translate(robot.x, robot.y);
  ctx.rotate(robot.heading * (Math.PI / 180));
  ctx.scale(0.5, 0.5);

  // Wheels are exposed on both sides of the chassis. Positive local x is forward.
  ctx.fillStyle = '#202936';
  ctx.fillRect(-18, -30, 36, 10);
  ctx.fillRect(-18, 20, 36, 10);
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(-10, -29, 20, 3);
  ctx.fillRect(-10, 26, 20, 3);

  ctx.fillStyle = '#45b979';
  ctx.beginPath();
  ctx.moveTo(-24, -19);
  ctx.lineTo(16, -19);
  ctx.lineTo(27, 0);
  ctx.lineTo(16, 19);
  ctx.lineTo(-24, 19);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#8de2ad';
  ctx.lineWidth = 2;
  ctx.stroke();

  // The yellow bumper marks the front of the robot.
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(23, -15, 7, 30);
  ctx.fillStyle = '#17202a';
  ctx.fillRect(27, -11, 6, 22);

  // Two front-facing line sensor pods.
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(18, -17, 7, 8);
  ctx.fillRect(18, 9, 7, 8);
  ctx.fillStyle = '#111111';
  ctx.fillRect(20, -15, 4, 4);
  ctx.fillRect(20, 11, 4, 4);

  fireLedPixels.forEach((color, index) => {
    ctx.fillStyle = color || '#273746';
    ctx.beginPath();
    ctx.arc(-15 + (index % 6) * 6, index < 6 ? -24 : 24, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(-12, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#85c1e9';
  ctx.beginPath();
  ctx.arc(-12, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

}

function resetRobot() {
  stopSimulation();
  createMaze();
  Object.assign(robot, { ...robotStart, distance: 0 });
  simulationTime = 0;
  challengeComplete = false;
  wallContact = false;
  challengeReadout.textContent = 'Ready';
  debugState = 'Ready';
  debugEvents = [];
  currentSensorReadings = 'n/a';
  previousSensorReadings = 'n/a';
  lastCommand = { label: 'Stopped', at: 0 };
  lastCollision = 'None';
  robotTrail = [];
  recordDebug('Maze reset');
  speedReadout.textContent = '0';
  headingReadout.textContent = `${Math.round(robot.heading)}°`;
  distanceReadout.textContent = '0 cm';
  lineReadout.textContent = `${lineSensorValue(BBLineSensor.Left)} / ${lineSensorValue(BBLineSensor.Right)}`;
  drawArena();
}

function animateRobot(time) {
  const elapsed = Math.min(time - lastAnimationTime, 100);
  lastAnimationTime = time;
  updateMovement(elapsed);
  requestAnimationFrame(animateRobot);
}

function stopSimulation() {
  runTimers.forEach((loop) => {
    loop.cancelled = true;
    clearTimeout(loop.timer);
  });
  runTimers = [];
  pauseWaiters = [];
  robot.leftMotor = 0;
  robot.rightMotor = 0;
  speedReadout.textContent = '0';
  renderDebug();
}

function setImportStatus(message, isError = false) {
  hexImportStatus.textContent = message;
  hexImportStatus.classList.toggle('is-error', isError);
}

function unsupportedApiCalls(source) {
  const supportedInputApis = new Set(Object.keys(input));
  const bitbotProApis = new Set([
    'enablePID', 'wheelSensor',
    'turnAngle', 'resetWheelSensors', 'lastEncoderError', 'motorTrim',
    'pidConstants', 'carryForwardErrors', 'clearPidErrors', 'stopThreshold',
    'setStartPWM', 'mergeLinePosition',
    'setThreshold', 'calibrateLine', 'batteryVoltage', 'setVolume',
    'onIREvent', 'irKey', 'lastIRCode', 'irKeyCode'
  ]);
  const warnings = [];
  const inputApis = [...source.matchAll(/\binput\.([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]);
  const unsupportedInputs = [...new Set(inputApis.filter((name) => !supportedInputApis.has(name)))];
  if (unsupportedInputs.length) warnings.push(`Unsupported input API: ${unsupportedInputs.map((name) => `input.${name}()`).join(', ')}`);

  const bitbotApis = [...source.matchAll(/\bbitbot\.([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]);
  const proCalls = [...new Set(bitbotApis.filter((name) => bitbotProApis.has(name)))];
  if (proCalls.length) warnings.push(`BitBot Pro API not simulated: ${proCalls.map((name) => `bitbot.${name}()`).join(', ')}`);

  return warnings;
}

function reportCompatibilityWarnings(source, addToLog = false) {
  const warnings = unsupportedApiCalls(source);
  if (!warnings.length) return warnings;
  setImportStatus(warnings.join(' | '), true);
  if (addToLog) warnings.forEach((warning) => recordDebug(`Warning: ${warning}`));
  return warnings;
}

function hexToBytes(hexText) {
  const bytes = [];
  const lines = hexText.trim().split(/\r?\n/);

  for (const line of lines) {
    const match = /^:([0-9a-f]{2})([0-9a-f]{4})([0-9a-f]{2})([0-9a-f]+)$/i.exec(line.trim());
    if (!match) continue;

    const byteCount = parseInt(match[1], 16);
    const recordType = parseInt(match[3], 16);
    const data = match[4].slice(0, byteCount * 2);
    if (data.length !== byteCount * 2) continue;
    if (recordType === 0 || recordType === 0x0e) {
      for (let index = 0; index < data.length; index += 2) {
        bytes.push(parseInt(data.slice(index, index + 2), 16));
      }
    }
  }

  return new Uint8Array(bytes);
}

function findEmbeddedSource(bytes) {
  const magic = [0x41, 0x14, 0x0e, 0x2f, 0xb8, 0x2f, 0xa2, 0xbb];
  for (let index = 0; index <= bytes.length - 16; index++) {
    if (!magic.every((value, offset) => bytes[index + offset] === value)) continue;

    const metaLength = bytes[index + 8] | (bytes[index + 9] << 8);
    const sourceLength = bytes[index + 10] | (bytes[index + 11] << 8) |
      (bytes[index + 12] << 16) | (bytes[index + 13] << 24);
    const start = index + 16;
    const end = start + metaLength + sourceLength;
    if (end <= bytes.length) {
      return {
        metadata: new TextDecoder().decode(bytes.slice(start, start + metaLength)),
        source: bytes.slice(start + metaLength, end)
      };
    }
  }
  throw new Error('This HEX file does not contain embedded MakeCode source.');
}

function decompressLzma(source) {
  return new Promise((resolve, reject) => {
    if (!window.LZMA) {
      reject(new Error('The source decoder could not be loaded. Check your internet connection and try again.'));
      return;
    }
    window.LZMA.decompress(source, (result, error) => {
      if (error) reject(new Error(error));
      else resolve(result);
    });
  });
}

function mainTsFromProject(source) {
  const project = JSON.parse(source);
  const mainTs = project.files && project.files['main.ts'];
  if (typeof mainTs !== 'string') {
    throw new Error('The MakeCode project does not include a main.ts file.');
  }
  return mainTs;
}

function publishedProjectId(value) {
  const shareLink = value.trim();
  const match = /(?:#pub:|\/)([A-Za-z0-9_-]+)\/?$/.exec(shareLink);
  if (!match) throw new Error('Paste a MakeCode share link or published project ID.');
  return match[1];
}

async function resolvedPublishedProjectId(projectId) {
  if (!projectId.startsWith('_')) return projectId;

  const response = await fetch(`https://makecode.microbit.org/api/${projectId}`);
  if (!response.ok) throw new Error('MakeCode could not find that published project.');

  const project = await response.json();
  if (!project.id) throw new Error('MakeCode returned an invalid published project.');
  return project.id;
}

async function importPublishedProject() {
  try {
    const projectId = await resolvedPublishedProjectId(publishedProjectId(publishedProjectUrl.value));
    setImportStatus('Loading published MakeCode project...');
    const response = await fetch(`https://makecode.microbit.org/api/${projectId}/text`);
    if (!response.ok) throw new Error('MakeCode could not find that published project.');

    const files = await response.json();
    const mainTs = files['main.ts'];
    if (typeof mainTs !== 'string') {
      throw new Error('The published project does not include a main.ts file.');
    }

    codeEditor.value = mainTs;
    renderCodeHighlight();
    setImportStatus('Published MakeCode source imported.');
  reportCompatibilityWarnings(mainTs);
  } catch (error) {
    console.error(error);
    setImportStatus(error.message || 'Could not load this published project.', true);
  }
}

async function importHexFile(file) {
  if (!file) return;
  if (!/\.hex$/i.test(file.name)) {
    setImportStatus('Choose a MakeCode .hex file.', true);
    return;
  }

  setImportStatus(`Reading ${file.name}...`);
  try {
    const bytes = hexToBytes(await file.text());
    const embedded = findEmbeddedSource(bytes);
    const metadata = JSON.parse(embedded.metadata);
    let projectSource;

    if (metadata.compression === 'LZMA') {
      projectSource = await decompressLzma(embedded.source);
    } else if (!metadata.compression) {
      projectSource = new TextDecoder().decode(embedded.source);
    } else {
      throw new Error(`Unsupported MakeCode compression: ${metadata.compression}.`);
    }

    codeEditor.value = mainTsFromProject(projectSource);
  renderCodeHighlight();
    hexDropLabel.textContent = file.name;
    setImportStatus('MakeCode source imported.');
    reportCompatibilityWarnings(codeEditor.value);
  } catch (error) {
    console.error(error);
    setImportStatus(error.message || 'Could not import this HEX file.', true);
  }
}

async function runCodeFromEditor() {
  stopSimulation();
  challengeComplete = false;
  challengeReadout.textContent = 'Running';
  debugState = 'Starting';
  debugEvents = [];
  recordDebug('Program started');
  const source = codeEditor.value;
  if (reportCompatibilityWarnings(source, true).length) {
    challengeReadout.textContent = 'Unsupported API';
    debugState = 'Unsupported API';
    return;
  }
  const script = compileMakeCodeScript(source);
  const runner = new Function('bitbot', 'basic', 'input', 'debug', 'BBDirection', 'BBRobotDirection', 'BBStopMode', 'BBMotor', 'BBLineSensor', 'BBPLineSensor', 'BBArcDirection', 'BBLightSensor', 'BBPingUnit', 'BBServos', 'BBArms', 'BBMode', 'BBModel', 'BBColors', 'IconNames', 'ArrowNames', `return (async () => { ${script}; return true; })();`);

  try {
    await runner(bitbot, basic, input, debug, BBDirection, BBRobotDirection, BBStopMode, BBMotor, BBLineSensor, BBPLineSensor, BBArcDirection, BBLightSensor, BBPingUnit, BBServos, BBArms, BBMode, BBModel, BBColors, IconNames, ArrowNames);
  } catch (error) {
    console.error(error);
    alert(`Script error: ${error.message}`);
  }
}

function bindControls() {
  codeEditor.addEventListener('input', () => {
    renderCodeHighlight();
  });
  codeEditor.addEventListener('scroll', () => {
    codeHighlight.scrollTop = codeEditor.scrollTop;
    codeHighlight.scrollLeft = codeEditor.scrollLeft;
  });
  document.querySelectorAll('[data-command]').forEach((button) => {
    button.addEventListener('click', () => {
      const command = button.dataset.command;
      if (command === 'forward') bitbot.go(BBDirection.Forward, 60);
      if (command === 'reverse') bitbot.go(BBDirection.Reverse, 60);
      if (command === 'left') bitbot.rotate(BBRobotDirection.Left, 50);
      if (command === 'right') bitbot.rotate(BBRobotDirection.Right, 50);
      if (command === 'brake') bitbot.stop(BBStopMode.Brake);
      if (command === 'coast') bitbot.stop(BBStopMode.Coast);
    });
  });

  document.getElementById('btnReset').addEventListener('click', resetRobot);
  mazeSeedControl.addEventListener('change', () => {
    mazeSeed = Number(mazeSeedControl.value) >>> 0;
    mazeSeedControl.value = String(mazeSeed);
    resetRobot();
  });
  document.getElementById('btnRun').addEventListener('click', runCodeFromEditor);
  document.getElementById('btnStop').addEventListener('click', () => {
    stopSimulation();
    challengeReadout.textContent = 'Stopped';
    updateMovement(0);
  });
  simulationSpeedControl.addEventListener('input', () => {
    simulationSpeed = Number(simulationSpeedControl.value) / 100;
    simulationSpeedValue.value = `${simulationSpeed}x`;
    simulationSpeedValue.textContent = `${simulationSpeed}x`;
  });
  btnLoadPublishedProject.addEventListener('click', importPublishedProject);
  publishedProjectUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') importPublishedProject();
  });
  document.getElementById('btnCopyDebug').addEventListener('click', async (event) => {
    const copyButton = event.currentTarget;
    try {
      await navigator.clipboard.writeText(debugReadout.textContent);
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1500);
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents(debugReadout);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyButton.textContent = 'Selected';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1500);
    }
  });
}

bindControls();
renderCodeHighlight();
resetRobot();
requestAnimationFrame(animateRobot);
