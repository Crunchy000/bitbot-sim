const STATE_DRIVE = 0;
const STATE_SQUARE = 1;
const STATE_REVERSE = 2;
const STATE_TURN = 3;
const STATE_ESCAPE_DRIVE = 4; // NEW: Timed drive for escaping dead ends

let currentState = STATE_DRIVE;
let stateTimer = 0;

let lastTurnEndTime = -9999; 
let nextTurnDuration = 670; 
let nextTurnDirection = BBRobotDirection.Left;

let collisionSequence = 0; 
let firstTurnDirection = BBRobotDirection.Left;
let isEscaping = false; // Flag to tell the robot what to do after turning

basic.forever(function () {
    let now = input.runningTime();

    if (now < stateTimer) {
        return; 
    }

    let left = bitbot.readLine(BBLineSensor.Left);
    let right = bitbot.readLine(BBLineSensor.Right);

    // STATE 0: Normal Drive
    if (currentState === STATE_DRIVE) {
        if (left && right) {
            bitbot.go(BBDirection.Forward, 30);
        } else {
            currentState = STATE_SQUARE;
        }
    } 
    
    // STATE 1: Square Up
    else if (currentState === STATE_SQUARE) {
        if (!left && !right) {
            
            if (now - lastTurnEndTime < 750) {
                collisionSequence++;
            } else {
                collisionSequence = 1; 
            }

            if (collisionSequence === 1) {
                nextTurnDuration = 670;
                firstTurnDirection = (Math.random() > 0.5) ? BBRobotDirection.Left : BBRobotDirection.Right;
                nextTurnDirection = firstTurnDirection;
            } 
            else if (collisionSequence === 2) {
                nextTurnDuration = 1370;
                nextTurnDirection = BBRobotDirection.Left; 
            } 
            else {
                // STEP 3: We are in a dead end! Turn to face the exit.
                nextTurnDuration = 670;
                nextTurnDirection = (firstTurnDirection === BBRobotDirection.Left) ? BBRobotDirection.Right : BBRobotDirection.Left;
                
                isEscaping = true; // Flag the upcoming turn to trigger an escape drive!
                collisionSequence = 0; 
            }

            currentState = STATE_REVERSE;
            bitbot.go(BBDirection.Reverse, 40);
            stateTimer = now + 300; 
        } 
        else if (!left && right) {
            bitbot.motor(BBMotor.Left, 0);
            bitbot.motor(BBMotor.Right, 30);
        } 
        else if (left && !right) {
            bitbot.motor(BBMotor.Left, 30);
            bitbot.motor(BBMotor.Right, 0);
        } 
        else {
            bitbot.go(BBDirection.Forward, 20);
        }
    }
    
    // STATE 2: Reverse
    else if (currentState === STATE_REVERSE) {
        currentState = STATE_TURN;
        bitbot.rotate(nextTurnDirection, 40); 
        stateTimer = now + nextTurnDuration;
    } 
    
    // STATE 3: Turn
    else if (currentState === STATE_TURN) {
        lastTurnEndTime = now;
        
        if (isEscaping) {
            // We just turned out of a dead end. Drive exactly one grid space!
            currentState = STATE_ESCAPE_DRIVE;
            bitbot.go(BBDirection.Forward, 30);
            stateTimer = now + 760; 
        } else {
            // Normal turn finished, go back to sensor driving
            currentState = STATE_DRIVE;
        }
    }
    
    // STATE 4: Escape Drive (Timed)
    else if (currentState === STATE_ESCAPE_DRIVE) {
        // We reached the intersection! Now turn randomly to pick a new path.
        currentState = STATE_TURN;
        nextTurnDuration = 670;
        nextTurnDirection = (Math.random() > 0.5) ? BBRobotDirection.Left : BBRobotDirection.Right;
        
        bitbot.rotate(nextTurnDirection, 40);
        stateTimer = now + nextTurnDuration;
        
        // Clear the flag so we go back to normal driving after this next turn
        isEscaping = false; 
    }
});