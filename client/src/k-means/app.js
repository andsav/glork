import { COLOR } from '../../lib/constants';
import { $, $$, $post, $ready } from '../../lib/$.js';
import { Canvas } from '../../lib/canvas.js';
import { collision } from '../../lib/helpers.js';

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

class CursorSlider extends Canvas {
    constructor(id, canvas) {
        super(id);

        this.ctx.beginPath();
        this.ctx.arc(MIN_CURSOR_RADIUS*2 + 10, this.halfHeight, MIN_CURSOR_RADIUS*2, 0, 2*Math.PI);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.ctx.fill();
    }
}

$ready(() => {
    const canvas = new KCanvas("c");
    const cursorSlider = new CursorSlider("cursor-slider", canvas);
});