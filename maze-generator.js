(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MazeGenerator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const arenaSize = 520;
  const margin = 60;
  const size = 5;
  const cellSize = (arenaSize - margin * 2) / size;

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  function createMaze(seed) {
    const random = seededRandom(seed);
    const cells = Array.from({ length: size }, () => Array.from(
      { length: size },
      () => ({ top: true, right: true, bottom: true, left: true, visited: false })
    ));
    const directions = [
      { row: -1, column: 0, wall: 'top', opposite: 'bottom' },
      { row: 0, column: 1, wall: 'right', opposite: 'left' },
      { row: 1, column: 0, wall: 'bottom', opposite: 'top' },
      { row: 0, column: -1, wall: 'left', opposite: 'right' }
    ];
    const stack = [{ row: 1, column: 0 }];
    cells[0][0].visited = true;
    cells[1][0].visited = true;
    cells[0][0].bottom = false;
    cells[1][0].top = false;

    while (stack.length) {
      const current = stack[stack.length - 1];
      const unvisited = directions.filter((direction) => {
        const row = current.row + direction.row;
        const column = current.column + direction.column;
        return row >= 0 && row < size && column >= 0 && column < size && !cells[row][column].visited;
      });
      if (!unvisited.length) {
        stack.pop();
        continue;
      }
      const direction = unvisited[Math.floor(random() * unvisited.length)];
      const next = { row: current.row + direction.row, column: current.column + direction.column };
      cells[current.row][current.column][direction.wall] = false;
      cells[next.row][next.column][direction.opposite] = false;
      cells[next.row][next.column].visited = true;
      stack.push(next);
    }

    const segments = [];
    cells.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
      const x = margin + columnIndex * cellSize;
      const y = margin + rowIndex * cellSize;
      if (cell.top) segments.push({ from: { x, y }, to: { x: x + cellSize, y } });
      if (cell.left) segments.push({ from: { x, y }, to: { x, y: y + cellSize } });
      if (rowIndex === size - 1 && cell.bottom) segments.push({ from: { x, y: y + cellSize }, to: { x: x + cellSize, y: y + cellSize } });
      if (columnIndex === size - 1 && cell.right) segments.push({ from: { x: x + cellSize, y }, to: { x: x + cellSize, y: y + cellSize } });
    }));

    const distances = Array.from({ length: size }, () => Array(size).fill(-1));
    const queue = [{ row: 0, column: 0 }];
    distances[0][0] = 0;
    let goalCell = queue[0];
    while (queue.length) {
      const current = queue.shift();
      if (distances[current.row][current.column] > distances[goalCell.row][goalCell.column]) goalCell = current;
      directions.forEach((direction) => {
        const next = { row: current.row + direction.row, column: current.column + direction.column };
        if (cells[current.row][current.column][direction.wall] || next.row < 0 || next.row >= size || next.column < 0 || next.column >= size || distances[next.row][next.column] !== -1) return;
        distances[next.row][next.column] = distances[current.row][current.column] + 1;
        queue.push(next);
      });
    }

    return {
      segments,
      start: { x: margin + cellSize / 2, y: margin + cellSize / 2, heading: 90 },
      goal: nudgeGoalTowardWall(cells[goalCell.row][goalCell.column], goalCell, cellSize),
      goalDistance: distances[goalCell.row][goalCell.column]
    };
  }

  function nudgeGoalTowardWall(cell, goalCell, cellSize) {
    const cellX = margin + goalCell.column * cellSize;
    const cellY = margin + goalCell.row * cellSize;
    const center = { x: cellX + cellSize / 2, y: cellY + cellSize / 2 };
    const wallOffset = 20;
    // Nudge the goal against a real wall so wall-following algorithms pass near it.
    if (cell.top) return { x: center.x, y: cellY + wallOffset };
    if (cell.bottom) return { x: center.x, y: cellY + cellSize - wallOffset };
    if (cell.left) return { x: cellX + wallOffset, y: center.y };
    if (cell.right) return { x: cellX + cellSize - wallOffset, y: center.y };
    return center;
  }

  return { createMaze };
});
