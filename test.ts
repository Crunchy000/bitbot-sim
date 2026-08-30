basic.forever(() => {
    bitbot.go(BBDirection.Forward, 60)
    basic.pause(1000)
    bitbot.rotate(BBRobotDirection.Left, 45)
    basic.pause(700)
    bitbot.stop(BBStopMode.Brake)
    basic.pause(500)
})
