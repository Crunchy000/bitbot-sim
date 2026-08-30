namespace pxsim {
    export interface BitBotSimState {
        left: number;
        right: number;
        heading: number;
        x: number;
        y: number;
    }

    export class BitBotSimBoard extends BaseBoard {
        public state: BitBotSimState;

        constructor() {
            super();
            this.state = {
                left: 0,
                right: 0,
                heading: 0,
                x: 0,
                y: 0
            };
        }

        public init(): void {
            super.init();
            this.state = {
                left: 0,
                right: 0,
                heading: 0,
                x: 0,
                y: 0
            };
        }

        public setDrive(left: number, right: number): void {
            this.state.left = Math.max(-100, Math.min(100, left));
            this.state.right = Math.max(-100, Math.min(100, right));
            this.state.heading = this.state.heading + (this.state.right - this.state.left) * 0.35;
            const radians = (this.state.heading - 90) * (Math.PI / 180);
            const speed = (this.state.left + this.state.right) / 2;
            this.state.x += Math.cos(radians) * speed * 0.25;
            this.state.y += Math.sin(radians) * speed * 0.25;
        }
    }

    export let board: BitBotSimBoard;

    export function init(): void {
        board = new BitBotSimBoard();
    }

    export function _go(direction: number, speed: number): void {
        const dir = direction === 0 ? 1 : -1;
        const value = Math.max(0, Math.min(100, speed)) * dir;
        board.setDrive(value, value);
    }

    export function _rotate(direction: number, speed: number): void {
        const value = Math.max(0, Math.min(100, speed));
        if (direction === 0) {
            board.setDrive(-value, value);
        } else {
            board.setDrive(value, -value);
        }
    }

    export function _stop(mode: number): void {
        board.setDrive(0, 0);
    }

    export function _move(motor: number, direction: number, speed: number): void {
        const dir = direction === 0 ? 1 : -1;
        const value = Math.max(0, Math.min(100, speed)) * dir;
        if (motor === 0 || motor === 2) {
            board.state.left = value;
        }
        if (motor === 1 || motor === 2) {
            board.state.right = value;
        }
    }
}
