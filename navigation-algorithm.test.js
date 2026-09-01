const assert = require('node:assert/strict');
const { checks, navigationStep } = require('./navigation-algorithm.js');

for (const [name, mode, left, right, expectedMode, expectedAction] of checks()) {
  const result = navigationStep(mode, left, right);
  assert.equal(result.mode, expectedMode, `${name}: mode`);
  assert.equal(result.action, expectedAction, `${name}: action`);
}

console.log(`${checks().length} navigation algorithm checks passed`);
