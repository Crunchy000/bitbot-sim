const { Modes, navigationStep } = require('./navigation-algorithm.js');
const { createMaze } = require('./maze-generator.js');

const arenaSize = 520;
const margin = 60;
const mazeSize = 5;
const cellSize = (arenaSize - margin * 2) / mazeSize;
const robotRadius = 11;
const tapeWidth = 16;
const lineSensorReach = tapeWidth / 2 + 6;
const tapeCollisionReach = 0;
const controlIntervalMs = 20;
const physicsIntervalMs = 20;
const maxDurationMs = 120000;

function pointToSegmentDistance(point, segment) {
  const deltaX = segment.to.x - segment.from.x;
  const deltaY = segment.to.y - segment.from.y;
  const lengthSquared = deltaX * deltaX + deltaY * deltaY;
  const progress = Math.min(Math.max(((point.x - segment.from.x) * deltaX + (point.y - segment.from.y) * deltaY) / lengthSquared, 0), 1);
  return Math.hypot(point.x - (segment.from.x + progress * deltaX), point.y - (segment.from.y + progress * deltaY));
}

function nearestTapeSegment(point, segments) {
  return segments.reduce((nearest, segment, index) => {
    const deltaX = segment.to.x - segment.from.x;
    const deltaY = segment.to.y - segment.from.y;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;
    const progress = Math.min(Math.max(((point.x - segment.from.x) * deltaX + (point.y - segment.from.y) * deltaY) / lengthSquared, 0), 1);
    const x = segment.from.x + progress * deltaX;
    const y = segment.from.y + progress * deltaY;
    const distance = Math.hypot(point.x - x, point.y - y);
    return distance < nearest.distance ? { distance, index, x, y } : nearest;
  }, { distance: Infinity, index: -1, x: 0, y: 0 });
}

function firstTapeCrossing(from, to, segments) {
  const moveX = to.x - from.x;
  const moveY = to.y - from.y;
  return segments.reduce((first, segment, index) => {
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

function slideAlongTape(current, next, segments) {
  const nextContact = firstTapeCrossing(current, next, segments) || nearestTapeSegment(next, segments);
  if (nextContact.distance > tapeCollisionReach) return { point: next, contact: null };

  const segment = segments[nextContact.index];
  const segmentX = segment.to.x - segment.from.x;
  const segmentY = segment.to.y - segment.from.y;
  const segmentLength = Math.hypot(segmentX, segmentY);
  const tangentX = segmentX / segmentLength;
  const tangentY = segmentY / segmentLength;
  const moveX = next.x - current.x;
  const moveY = next.y - current.y;
  const projectedDistance = moveX * tangentX + moveY * tangentY;
  let point = { x: current.x + tangentX * projectedDistance, y: current.y + tangentY * projectedDistance };
  const slideContact = nearestTapeSegment(point, segments);
  if (slideContact.distance < tapeCollisionReach) {
    const currentContact = nearestTapeSegment(current, segments);
    const normalLength = Math.hypot(current.x - currentContact.x, current.y - currentContact.y) || 1;
    point = {
      x: slideContact.x + (current.x - currentContact.x) / normalLength * (tapeCollisionReach + 0.1),
      y: slideContact.y + (current.y - currentContact.y) / normalLength * (tapeCollisionReach + 0.1)
    };
  }
  return { point, contact: nextContact };
}

function diagnostic(seed) {
  const maze = createMaze(seed);
  const robot = { ...maze.start };
  let mode = Modes.Follow;
  let action = 'forward';
  let wallContacts = 0;
  const trace = [];
  let previousTraceEntry = '';

  const tapeDistance = (point) => Math.min(...maze.segments.map((segment) => pointToSegmentDistance(point, segment)));
  const sensor = (side) => {
    const radians = robot.heading * Math.PI / 180;
    const point = {
      x: robot.x + Math.cos(radians) * 11 - Math.sin(radians) * side,
      y: robot.y + Math.sin(radians) * 11 + Math.cos(radians) * side
    };
    return tapeDistance(point) <= lineSensorReach ? 0 : 1;
  };

  for (let elapsedMs = 0; elapsedMs <= maxDurationMs; elapsedMs += physicsIntervalMs) {
    if (elapsedMs % controlIntervalMs === 0) {
      const left = sensor(-6.5);
      const right = sensor(6.5);
      const next = navigationStep(mode, left, right);
      mode = next.mode;
      action = next.action;
      const traceEntry = `${left}${right} ${next.action} (${next.state})`;
      if (traceEntry !== previousTraceEntry && trace.length < 80) {
        trace.push(`${elapsedMs}ms ${traceEntry}`);
        previousTraceEntry = traceEntry;
      }
    }

    const motors = action === 'turn-right' ? [-30, 30]
      : action === 'turn-left' ? [30, -30]
        : action === 'veer-left' ? [35, 30]
          : action === 'veer-right' ? [30, 35]
            : [35, 35];
    const left = motors[0] / 100;
    const right = motors[1] / 100;
    robot.heading = ((robot.heading + (right - left) * 0.8 * 4) % 360 + 360) % 360;
    const radians = robot.heading * Math.PI / 180;
    const step = ((left + right) / 2) * 1.3 * 1.4;
    const next = { x: robot.x + Math.cos(radians) * step * 2.2, y: robot.y + Math.sin(radians) * step * 2.2 };
    const edgeInset = robotRadius + 10;
    if (next.x <= edgeInset || next.x >= arenaSize - edgeInset || next.y <= edgeInset || next.y >= arenaSize - edgeInset) {
      return { seed, success: false, reason: 'edge hit', elapsedMs, wallContacts, goalDistance: maze.goalDistance, position: robot, goal: maze.goal, trace };
    }
    const tapeMove = Math.abs(step) > 0.0001 ? slideAlongTape(robot, next, maze.segments) : { point: next, contact: null };
    if (tapeMove.contact) wallContacts += 1;
    robot.x = tapeMove.point.x;
    robot.y = tapeMove.point.y;
    if (Math.hypot(robot.x - maze.goal.x, robot.y - maze.goal.y) <= 26) {
      return { seed, success: true, reason: 'goal reached', elapsedMs, wallContacts, goalDistance: maze.goalDistance, trace };
    }
  }
  return { seed, success: false, reason: 'timed out', elapsedMs: maxDurationMs, wallContacts, goalDistance: maze.goalDistance, position: robot, goal: maze.goal, trace };
}

if (require.main === module) {
  const seeds = process.argv.slice(2).map(Number).filter(Number.isFinite);
  const results = (seeds.length ? seeds : [1, 2, 3, 4, 5]).map(diagnostic);
  for (const result of results) {
    console.log(`seed ${result.seed}: ${result.success ? `reached goal in ${result.elapsedMs}ms` : `${result.reason} at ${result.elapsedMs}ms`}; maze distance ${result.goalDistance}; wall contacts ${result.wallContacts}`);
    if (!result.success) console.log(result.trace.join('\n'));
  }
  if (results.some((result) => !result.success)) process.exitCode = 1;
}

module.exports = { createMaze, diagnostic };
