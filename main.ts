enum BBDirection {
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse
}

enum BBRobotDirection {
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum BBStopMode {
    //% block="coast"
    Coast,
    //% block="brake"
    Brake
}

enum BBMotor {
    //% block="left"
    Left,
    //% block="right"
    Right,
    //% block="both"
    Both
}

enum BBLineSensor {
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum BBLightSensor {
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum BBPingUnit {
    //% block="cm"
    Centimeters,
    //% block="in"
    Inches,
    //% block="us"
    MicroSeconds
}

enum BBColors {
    //% block=red
    Red = 0xff0000,
    //% block=green
    Green = 0x00ff00,
    //% block=blue
    Blue = 0x0000ff,
    //% block=yellow
    Yellow = 0xffff00,
    //% block=white
    White = 0xffffff
}

//% weight=50 color=#e7660b icon="\uf1b9"
namespace bitbot {
    //% blockId=bitbot_go block="go %direction at speed %speed" 
    //% speed.min=0 speed.max=100
    export function go(direction: BBDirection, speed: number): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_rotate block="spin %direction at speed %speed" 
    //% speed.min=0 speed.max=100
    export function rotate(direction: BBRobotDirection, speed: number): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_stop block="stop with %mode"
    export function stop(mode: BBStopMode): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_move block="move %motor motor(s) %direction at speed %speed"
    //% speed.min=0 speed.max=100
    export function move(motor: BBMotor, direction: BBDirection, speed: number): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_motor block="drive %motor at speed %speed"
    //% speed.min=-100 speed.max=100
    export function motor(motor: BBMotor, speed: number): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_buzz block="buzz %on"
    export function buzz(on: boolean): void {
        // implemented by the browser simulator
    }

    //% blockId=bitbot_line block="read line sensor %sensor"
    export function readLine(sensor: BBLineSensor): number { return 0; }

    //% blockId=bitbot_light block="read light sensor %sensor"
    export function readLight(sensor: BBLightSensor): number { return 0; }

    //% blockId=bitbot_sonar block="read sonar as %unit"
    export function sonar(unit: BBPingUnit): number { return 0; }

    //% blockId=bitbot_set_led block="set all LEDs to %color"
    export function setLedColor(color: number): void {}

    //% blockId=bitbot_clear block="clear LEDs"
    export function ledClear(): void {}

    //% blockId=bitbot_pixel block="set LED %pixel to %color"
    export function setPixelColor(pixel: number, color: number): void {}

    //% blockId=bitbot_rainbow block="show rainbow"
    export function ledRainbow(): void {}

    //% blockId=bitbot_shift block="shift LEDs"
    export function ledShift(): void {}

    //% blockId=bitbot_rotate_leds block="rotate LEDs"
    export function ledRotate(): void {}

    //% blockId=bitbot_update block="set LED update mode %mode"
    export function setUpdateMode(mode: number): void {}

    //% blockId=bitbot_brightness block="set LED brightness %brightness"
    export function ledBrightness(brightness: number): void {}
}
