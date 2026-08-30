const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');
const speedReadout = document.getElementById('speedReadout');
const headingReadout = document.getElementById('headingReadout');
const distanceReadout = document.getElementById('distanceReadout');
const codeEditor = document.getElementById('codeEditor');

const arenaSize = 520;
const robotRadius = 22;
const robotStart = { x: arenaSize / 2, y: arenaSize / 2, heading: 0, leftMotor: 0, rightMotor: 0 };

const robot = { ...robotStart, distance: 0 };

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

const BBLightSensor = {
  Left: 0,
  Right: 1
};

const BBPingUnit = {
  Centimeters: 0,
  Inches: 1,
  MicroSeconds: 2
};

const BBColors = {
  Red: 0xff0000,
  Green: 0x00ff00,
  Blue: 0x0000ff,
  Yellow: 0xffff00,
  White: 0xffffff
};

const basic = {
  pause: async (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

const bitbot = {
  state: { ...robotStart },

  select_model() {},
  getModel() { return 'sim'; },
  go(direction, speed) {
    const safeSpeed = clamp(Math.round(speed), -100, 100);
    const dir = direction === BBDirection.Forward ? 1 : -1;
    robot.leftMotor = safeSpeed * dir;
    robot.rightMotor = safeSpeed * dir;
    updateMovement();
  },
  motor(motor, speed) {
    const safeSpeed = clamp(Math.round(speed), -100, 100);
    if (motor === BBMotor.Left || motor === BBMotor.Both) robot.leftMotor = safeSpeed;
    if (motor === BBMotor.Right || motor === BBMotor.Both) robot.rightMotor = safeSpeed;
    updateMovement();
  },
  move(motor, direction, speed) {
    const safeSpeed = clamp(Math.round(speed), 0, 100);
    const dir = direction === BBDirection.Forward ? 1 : -1;
    if (motor === BBMotor.Left || motor === BBMotor.Both) robot.leftMotor = safeSpeed * dir;
    if (motor === BBMotor.Right || motor === BBMotor.Both) robot.rightMotor = safeSpeed * dir;
    updateMovement();
  },
  rotate(direction, speed) {
    const safeSpeed = clamp(Math.round(speed), 0, 100);
    const left = direction === BBRobotDirection.Left ? -safeSpeed : safeSpeed;
    const right = direction === BBRobotDirection.Left ? safeSpeed : -safeSpeed;
    robot.leftMotor = left;
    robot.rightMotor = right;
    updateMovement();
  },
  stop(mode) {
    robot.leftMotor = 0;
    robot.rightMotor = 0;
    if (mode === BBStopMode.Brake) {
      robot.heading = normalizeHeading(robot.heading);
    }
    updateMovement();
  },
  buzz(on) {
    console.log('buzz', on ? 'on' : 'off');
  },
  readLine() {
    return 0;
  },
  readLight() {
    return 120;
  },
  sonar() {
    return 25;
  },
  setLedColor() {},
  ledClear() {},
  setPixelColor() {},
  ledRainbow() {},
  ledShift() {},
  ledRotate() {},
  setUpdateMode() {},
  ledBrightness() {}
};

function updateMovement() {
  const left = robot.leftMotor / 100;
  const right = robot.rightMotor / 100;
  const turnRate = (right - left) * 0.8;
  robot.heading = normalizeHeading(robot.heading + turnRate * 4);

  const speedFactor = ((left + right) / 2) * 1.3;
  const radians = robot.heading * (Math.PI / 180);
  const step = speedFactor * 1.4;

  robot.x = clamp(robot.x + Math.cos(radians) * step * 2.2, robotRadius + 10, arenaSize - robotRadius - 10);
  robot.y = clamp(robot.y + Math.sin(radians) * step * 2.2, robotRadius + 10, arenaSize - robotRadius - 10);
  robot.distance += Math.abs(step * 10);

  const overallSpeed = Math.abs((robot.leftMotor + robot.rightMotor) / 2);
  speedReadout.textContent = String(Math.round(overallSpeed));
  headingReadout.textContent = `${Math.round(robot.heading)}°`;
  distanceReadout.textContent = `${Math.round(robot.distance)} cm`;

  drawArena();
}

function drawArena() {
  ctx.clearRect(0, 0, arenaSize, arenaSize);

  // floor grid
  ctx.fillStyle = '#102437';
  ctx.fillRect(0, 0, arenaSize, arenaSize);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= arenaSize; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, arenaSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(arenaSize, i);
    ctx.stroke();
  }

  // robot body
  ctx.save();
  ctx.translate(robot.x, robot.y);
  ctx.rotate((robot.heading - 90) * (Math.PI / 180));

  ctx.fillStyle = '#58d68d';
  ctx.fillRect(-18, -24, 36, 48);

  ctx.fillStyle = '#1f2937';
  ctx.fillRect(-10, -34, 20, 12);
  ctx.fillRect(-10, 22, 20, 12);

  ctx.fillStyle = '#f1c40f';
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(34, 0);
  ctx.lineTo(26, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // bumper line
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(arenaSize / 2, 10);
  ctx.lineTo(arenaSize / 2 + 100, 10);
  ctx.stroke();
}

function resetRobot() {
  Object.assign(robot, { ...robotStart, distance: 0 });
  speedReadout.textContent = '0';
  headingReadout.textContent = '0°';
  distanceReadout.textContent = '0 cm';
  drawArena();
}

async function runCodeFromEditor() {
  const script = codeEditor.value;
  const runner = new Function('bitbot', 'basic', 'BBDirection', 'BBRobotDirection', 'BBStopMode', 'BBMotor', 'BBLineSensor', 'BBLightSensor', 'BBPingUnit', 'BBColors', `${script}; return true;`);

  try {
    await runner(bitbot, basic, BBDirection, BBRobotDirection, BBStopMode, BBMotor, BBLineSensor, BBLightSensor, BBPingUnit, BBColors);
  } catch (error) {
    console.error(error);
    alert(`Script error: ${error.message}`);
  }
}

function bindControls() {
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
  document.getElementById('btnRun').addEventListener('click', runCodeFromEditor);
  document.getElementById('btnLoadDemo').addEventListener('click', () => {
    codeEditor.value = `(async () => {
  bitbot.go(BBDirection.Forward, 60);
  await basic.pause(1000);
  bitbot.rotate(BBRobotDirection.Left, 45);
  await basic.pause(700);
  bitbot.stop(BBStopMode.Brake);
})();`;
  });
}

bindControls();
drawArena();
