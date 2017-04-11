import { $, $$, $post, $ready } from '../../lib/$.js';
import { Canvas } from '../../lib/canvas.js';

class KCanvas extends Canvas {
    constructor(id) {
        super(id);

        let _this = this;
        this.c.onclick = function (e) {
            let m = _this.mouse(e);
            _this.placePoint(m.x, m.y);
        };
    }

    placePoint(x, y) {
        this.drawCircle(x, y, 3);
    }
}

$ready(() => {
    const canvas = new KCanvas("c");
});