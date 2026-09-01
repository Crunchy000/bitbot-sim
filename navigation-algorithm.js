(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NavigationAlgorithm = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const Modes = {
    Follow: 0,
    TurnRightAtFront: 100,
    DepartAfterTurn: 200
  };
  const frontTurnTicks = 47;
  const departureTicks = 20;

  function navigationStep(mode, leftSensor, rightSensor) {
    if (mode >= Modes.TurnRightAtFront && mode < Modes.TurnRightAtFront + frontTurnTicks) {
      return { mode: mode + 1, action: 'turn-right', state: 'Front wall - turning right' };
    }
    if (mode === Modes.TurnRightAtFront + frontTurnTicks) {
      return { mode: Modes.DepartAfterTurn, action: 'forward', state: 'Right turn complete' };
    }
    if (mode >= Modes.DepartAfterTurn && mode < Modes.DepartAfterTurn + departureTicks) {
      return { mode: mode + 1, action: 'forward', state: 'Clearing left corner' };
    }
    if (mode === Modes.DepartAfterTurn + departureTicks) {
      return { mode: Modes.Follow, action: 'veer-left', state: 'Following left wall' };
    }
    if (leftSensor === 0 && rightSensor === 0) return { mode: Modes.TurnRightAtFront, action: 'turn-right', state: 'Front wall - turning right' };
    if (leftSensor === 0) return { mode: Modes.Follow, action: 'veer-right', state: 'Left wall detected - veering right' };
    return { mode: Modes.Follow, action: 'veer-left', state: 'Seeking left wall' };
  }

  function checks() {
    return [
      ['clear carpet seeks the left wall', Modes.Follow, 1, 1, Modes.Follow, 'veer-left'],
      ['front tape starts a calibrated right turn', Modes.Follow, 0, 0, Modes.TurnRightAtFront, 'turn-right'],
      ['front turn advances independently of sensors', Modes.TurnRightAtFront, 1, 1, Modes.TurnRightAtFront + 1, 'turn-right'],
      ['front turn begins its departure after the fixed duration', Modes.TurnRightAtFront + frontTurnTicks, 0, 0, Modes.DepartAfterTurn, 'forward'],
      ['corner departure ignores residual tape', Modes.DepartAfterTurn, 0, 0, Modes.DepartAfterTurn + 1, 'forward'],
      ['left tape steers away from the wall', Modes.Follow, 0, 1, Modes.Follow, 'veer-right'],
      ['clear carpet seeks the left wall', Modes.Follow, 1, 1, Modes.Follow, 'veer-left'],
      ['right tape still seeks the left wall', Modes.Follow, 1, 0, Modes.Follow, 'veer-left']
    ];
  }

  return { Modes, navigationStep, checks };
});
