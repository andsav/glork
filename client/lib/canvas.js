import { COLOR } from './constants.js';
import { $ } from './$.js';

export class Canvas {
    constructor(id) {
        this.c = $(id);
        this.ctx = this.c.getContext('2d');
        this.ctx.fillStyle = this.ctx.strokeStyle = COLOR.DEFAULT;
        this.ctx.lineWidth = 2;
    }

    hide() {
        this.c.style.display = "none";
    }

    show() {
        this.c.style.display = "initial";
        this.c.scrollIntoView();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    }

    mouse(e) {
        return {
            x: e.pageX - this.c.offsetLeft,
            y: e.pageY - this.c.offsetTop
        }
    }

    get halfWidth() {
        return this.c.width / 2;
    }

    get halfHeight() {
        return this.c.height / 2;
    }

    placeNode(x, y, side = 10) {
        if (x > side+2 && x < this.c.width - (side+2) && y > side+2 && y < this.c.height - (side+2)) {
            this.drawNode(x, y, side);
        }
    }

    drawNode(x, y, side = 10) {
        this.ctx.fillRect(x - side/2, y - side/2, side, side);
    }

}