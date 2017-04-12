import { COLOR } from '../../lib/constants.js';
import { $, $$, $post, $ready } from '../../lib/$.js';
import { Canvas, SliderCanvas } from '../../lib/canvas.js';
import { collision, in_circle } from '../../lib/helpers.js';

const MIN_CURSOR_RADIUS = 4;
const MAX_CURSOR_RADIUS = 30;

class KCanvas extends Canvas {
    constructor(id) {
        super(id);

        this.points = [];
        this.cursorRadius = MIN_CURSOR_RADIUS;
        this.updateCursor(MIN_CURSOR_RADIUS);

        let _this = this;

        this.c.onclick = function (e) {
            let m = _this.mouse(e);
            _this.placePoint(m.x, m.y);
        };
    }

    updateCursor(r) {
        this.cursorRadius = r;
        this.c.style.cursor = 'url(\'data:image/svg+xml;utf8,' +
            '<svg fill="none" ' +
                'height="' + r*4 + '" ' +
                'viewBox="0 0 ' + r*2 + ' ' + r*2 + '" ' +
                'width="' + r*4 + '" ' +
                'xmlns="http://www.w3.org/2000/svg">' +
            '<circle fill-opacity="0.4" fill="black" cx="' + r + '" cy="' + r + '" r="' + r + '" stroke="none" stroke-width="1" />' +
            '</svg>\') ' + r*2 + ' ' + r*2 + ', auto';

        document.body.style.cursor = 'default';
    }

    placePoint(x, y) {
        if (!collision(this.points, [x, y], 7)) {
            this.points.push([x, y]);
            this.placeNode(x, y, true, 6);
        }
    }
}

class CursorSlider extends SliderCanvas {

    constructor(id, canvas) {
        super(id, function(c) {
            return {
                x: 20 + ((Math.min(canvas.cursorRadius, MIN_CURSOR_RADIUS) - MIN_CURSOR_RADIUS) / MAX_CURSOR_RADIUS) * (c.width - 40),
                y: c.halfHeight,
                r: Math.min(canvas.cursorRadius, MIN_CURSOR_RADIUS) * 2
            };
        });

        this.canvas = canvas;
    }

    overButton(m) {
        return in_circle(m, this.button, this.button.r);
    }

    setConfig(m) {
        let v = (m.x - 20)/(this.width-40) * (MAX_CURSOR_RADIUS - MIN_CURSOR_RADIUS) + MIN_CURSOR_RADIUS;
        let r = Math.max(MIN_CURSOR_RADIUS, Math.min(MAX_CURSOR_RADIUS, v));
        this.canvas.updateCursor(r);
        this.button = {
            x: Math.max(20, Math.min(this.width-20, m.x)),
            y: this.halfHeight,
            r: 2*r
        };
        this.update();
    }

    update() {
        this.clear();
        this.drawLine();
        this.drawCursor();
    }

    drawLine() {
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.halfHeight);
        this.ctx.lineTo(this.width - 20, this.halfHeight);
        this.ctx.stroke();
    }

    drawCursor() {
        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, 4, 0, 2*Math.PI);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, this.button.r, 0, 2*Math.PI);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.ctx.fill();

        this.ctx.fillStyle = COLOR.WHITE;
    }
}

$ready(() => {
    const canvas = new KCanvas("c");
    const cursorSlider = new CursorSlider("cursor-slider", canvas);
});