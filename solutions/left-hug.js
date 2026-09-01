let isSearching = true;

basic.forever(function () {
    // 1 = Floor, 0 = Tape (Wall)
    let left = bitbot.readLine(BBLineSensor.Left);
    let right = bitbot.readLine(BBLineSensor.Right);

    if (isSearching == true) {
        if (left == 1 && right == 1) {
            // Searching: drive straight!
            bitbot.go(BBDirection.Forward, 30);
        } else {
            isSearching = false;
        }
    } 
    else {
        // --- LEFT-WALL HUGGING LOGIC ---
        
        if (left == 0 && right == 0) {
            // FRONT CRASH! We hit a dead-end or flat wall.
            // Spin RIGHT in place to turn around.
            bitbot.motor(BBMotor.Left, 30);
            bitbot.motor(BBMotor.Right, -30);
        }
        else if (left == 0) {
            // Left sensor is ON the tape.
            // Curve right to get off it, but KEEP moving forward (40/10) 
            bitbot.motor(BBMotor.Left, 40);
            bitbot.motor(BBMotor.Right, 10);
        } 
        else if (right == 0) {
            // Hit the wrong wall! Steer left to push away from it.
            bitbot.motor(BBMotor.Left, -10);
            bitbot.motor(BBMotor.Right, 40);
        }
        else {
            // We see only floor! We lost our left wall.
            // Curve left SHARPLY (10/40) to find the tape again.
            bitbot.motor(BBMotor.Left, -40);
            bitbot.motor(BBMotor.Right, 40);
        }
    }
});