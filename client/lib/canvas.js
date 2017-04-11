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
}