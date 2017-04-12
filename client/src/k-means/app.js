import { COLOR } from '../../lib/constants.js';
import { $, $$, $post, $ready } from '../../lib/$.js';
import { Canvas, SliderCanvas } from '../../lib/canvas.js';
import { collision, in_circle, rand, clear_timeout } from '../../lib/helpers.js';

const MIN_CURSOR_RADIUS = 4;
const MAX_CURSOR_RADIUS = 30;
const POINTS_DELAY = 75;

class KCanvas extends Canvas {
    constructor(id) {
        super(id);

        this.points = [];
        this.cursor_radius = MIN_CURSOR_RADIUS;
        this.update_cursor(MIN_CURSOR_RADIUS);

        let _this = this;
        this.timer = null;
        let m = { x: 0, y: 0 };

        this.c.onmousedown = function(e) {
            m = _this.mouse(e);
            _this.timer = setInterval(function() {
                _this.placePoint(
                    m.x + rand(-1 * _this.cursor_radius, _this.cursor_radius),
                    m.y + rand(-1 * _this.cursor_radius, _this.cursor_radius)
                );
            }, POINTS_DELAY);
        };

        this.c.onmousemove = function(e) {
            m = _this.mouse(e);
            if(m.x < 6 || m.y < 6 || m.x > this.width - 6 || m.y > this.height - 6) {
                clearInterval(_this.timer);
            }
        };

        this.c.onmouseup = function() {
            if(_this.timer) {
                clearInterval(_this.timer);
            }
        };
    }

    update_cursor(r) {
        this.cursor_radius = r;
        this.c.style.cursor = 'url(\'data:image/svg+xml;utf8,' +
            '<svg fill="none" ' +
                'height="' + r*4 + '" ' +
                'viewBox="0 0 ' + r*2 + ' ' + r*2 + '" ' +
                'width="' + r*4 + '" ' +
                'xmlns="http://www.w3.org/2000/svg">' +
            '<circle fill-opacity="0.4" fill="black" cx="' + r + '" cy="' + r + '" r="' + r + '" stroke="none" stroke-width="1" />' +
            '</svg>\') ' + r*2 + ' ' + r*2 + ', auto';
    }

    placePoint(x, y) {
        if (!collision(this.points, [x, y], 7)) {
            this.points.push([x, y]);
            this.placeNode(x, y, true, 6);
        }
    }

    reset() {
        clear_timeout();
        this.clear();
        this.points = [];
    }
}

class CursorSlider extends SliderCanvas {

    constructor(id, canvas) {
        super(id, function(c) {
            return {
                x: 20 + ((Math.min(canvas.cursor_radius, MIN_CURSOR_RADIUS) - MIN_CURSOR_RADIUS) / MAX_CURSOR_RADIUS) * (c.width - 40),
                y: c.halfHeight,
                r: Math.min(canvas.cursor_radius, MIN_CURSOR_RADIUS) * 2
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
        this.canvas.update_cursor(r);
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
    const canvas = new KCanvas("c"),
          cursorSlider = new CursorSlider("cursor-slider", canvas);

    $("reset").onclick = () => {
        canvas.reset();
    };
});