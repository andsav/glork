"use strict";

import { ENDPOINTS, COLOR } from '../../lib/constants.js';
import { $, $$, $post } from '../../lib/$.js';
import { dist, round, shuffle, rand, clear_timeout } from '../../lib/helpers.js';

// Quick and dirty return random element form array (not really random)
Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
};

// Configuration
const DELAY = 30; // milliseconds between frame refresh
const DEFAULT_FONT = "14pt Courier New";
const CONFIG_BUTTON_RADIUS = 6;

let error = (elem, err) => {
    let err_msg = $("error_msg");

    elem.classList.add('shake', 'shake-constant');
    err_msg.innerHTML = err;
    err_msg.style.opacity = 1;

    setTimeout(function () {
        elem.classList.remove('shake', 'shake-constant');
    }, 300);

    setTimeout(function () {
        err_msg.style.opacity = 0;
    }, 2000);
};

class CanvasBase {
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

class MainCanvas extends CanvasBase {
    constructor(id) {
        super(id);

        this.path = new Path([]);
        let _this = this;

        this.c.onclick = function (e) {
            let m = _this.mouse(e);
            _this.placePoint(m.x, m.y);
        };
    }

    placePoint(x, y) {
        if (x > 12
            && x < this.c.width - 12
            && y > 12
            && y < this.c.height - 12
            && !this.path.map((co) => dist(co, [x, y]) > 12).includes(false)) {

            this.path.push([x, y]);
            this.drawNode(x, y);
        }
    }

    drawNode(x, y) {
        this.ctx.fillRect(x - 5, y - 5, 10, 10);
    }

    random(points) {
        this.reset();
        while (this.coordinates.length < points) {
            this.placePoint(rand(15, this.c.width - 15), rand(15, this.c.height - 15))
        }
    }

    redraw() {
        this.clear();
        this.coordinates.forEach((c) => {
            this.drawNode(c[0], c[1]);
        });
    }

    reset() {
        clear_timeout();
        this.clear();
        this.path.clear();
    }

    loading_sa(result, path = Path.random(this.coordinates)) {
        result.show();
        path.trace(this);
        result.output_sa_helper(path);

        let _this = this;
        setTimeout(() => {
            _this.loading_sa(result /*, path.neighbour*/);
        }, DELAY);
    }

    loading_lbs(path = Path.random(this.coordinates)) {
        path.trace(this);
        let _this = this;
        setTimeout(() => {
            _this.loading_lbs();
        }, DELAY);
    }

    trace(path) {
        this.redraw();
        this.ctx.beginPath();
        this.ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; ++i) {
            this.ctx.lineTo(path[i][0], path[i][1]);
        }
        this.ctx.lineTo(path[0][0], path[0][1]);
        this.ctx.stroke();
    }

    get solver() {
        return {
            'sa': {
                'p': this.path.object,
                'config': [parseFloat($('config_sa').dataset['x']), parseFloat($('config_sa').dataset['y'])]
            },
            'lbs': {
                'p': this.path.object,
                'config': [parseFloat($('config_lbs').dataset['x']), parseFloat($('config_lbs').dataset['y'])]
            }
        };
    }

    get coordinates() {
        return this.path.p;
    }

}

class ResultCanvas extends CanvasBase {
    constructor(id) {
        super(id);
        this.ctx.font = DEFAULT_FONT;
        this.initial = 0;
        this.cooling = 0;
    }

    clear_half() {
        this.ctx.clearRect(0, 0, this.halfWidth, this.c.height);
    }

    output_sa_helper(path, i = 0, max = 0, cooling = 0.98) {
        if (i === 0) {
            this.clear();
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.halfHeight);
            this.ctx.lineTo(this.c.width, this.halfHeight);
            this.ctx.stroke();
        } else {
            this.clear_half();
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.halfHeight);
            this.ctx.lineTo(this.halfWidth, this.halfHeight);
            this.ctx.stroke();
        }

        let t = round(Math.pow(cooling, i), 1e7),
            length = path.length;

        if (i === 1) {
            this.initial = length;
        }

        this.ctx.fillStyle = COLOR.WHITE;
        if (i !== 0) {
            let x = this.halfWidth + this.halfWidth / max * i,
                y = Math.max(this.c.height - (length / this.initial) * this.halfHeight * .67, this.halfHeight),
                h = this.c.height - y,
                w = this.halfWidth / max,
                y2 = this.halfHeight - t * this.halfHeight,
                h2 = this.halfHeight - y2;

            this.ctx.fillRect(x, y, w, h);
            this.ctx.fillRect(x, y2, w, h2);
        }

        this.ctx.fillText("    T°: " + (t === 1 ? "1.0000000" : String(t)), 20, 26);
        this.ctx.fillText("Length: " + String(length), 20, this.halfHeight + 26);
        this.ctx.fillStyle = COLOR.DEFAULT;
    }

    output_sa(canvas, solution, i = 1) {
        if (i === 1) {
            clear_timeout();
            this.cooling = $('config_sa').dataset['x'];
        }
        if (i >= solution.length) {
            return 0;
        } else {
            let p = Path.fromObject(solution[i]);
            p.trace(canvas);
            this.output_sa_helper(p, i, solution.length, this.cooling);

            let _this = this;
            setTimeout(function () {
                _this.output_sa(canvas, solution, i + 1)
            }, DELAY);

            return 0;
        }
    }

    loading_lbs() {
        this.show();
        this.clear();
        let n = parseInt($("config_lbs").dataset['x'], 10);

        this.ctx.fillStyle = COLOR.BLACK;
        for (let i = 0; i < n; ++i) {
            let h = this.c.height * 0.5,
                w = this.c.width / n,
                y = this.c.height - h,
                x = i * w;

            this.ctx.fillRect(x, y, w, h);
        }
        this.ctx.fillStyle = COLOR.DEFAULT;
    };

    output_lbs(canvas, solution) {
        clear_timeout();
        this.clear();

        const worst = Path.fromObject(solution[0]),
            best = Path.fromObject(solution[solution.length - 1]),
            max = worst.length,
            min = best.length;

        shuffle(solution);

        let i = 0, found_best = false;
        this.ctx.fillStyle = "#001427";
        solution.forEach((s) => {
            let path = Path.fromObject(s),
                h = (path.length / max) * this.halfHeight,
                w = this.c.width / solution.length,
                y = this.c.height - h,
                x = i++ * w;

            if (path.length == min && !found_best) {
                this.ctx.fillStyle = COLOR.WHITE;

                let offset = this.ctx.measureText(String(min)).width;
                this.ctx.fillText(min, Math.min(Math.max(x + w/2 - offset/2, 2), this.c.width - offset - 2), 20);

                found_best = true;
            }

            this.ctx.fillRect(x, y, w, h);
            this.ctx.fillStyle = "#001427";
        });

        best.trace(canvas);
        this.ctx.fillStyle = COLOR.DEFAULT
    }
}

class ConfigCanvas extends CanvasBase {
    constructor(id) {
        super(id);

        this.button = this.configToButton;

        this.ctx.lineCap = 'round';
        this.update();

        let _this = this;
        let click = false;

        this.c.ontouchstart = function (e) {
            _this.setConfig(_this.mouse(e));
        };

        this.c.onmousedown = function (e) {
            let m = _this.mouse(e);
            if (!_this.overButton(m)) {
                _this.setConfig(m);
            }
            click = true;

        };

        this.c.onmousemove = function (e) {
            let m = _this.mouse(e);
            _this.c.style.cursor = _this.overButton(_this.mouse(e)) ? "pointer" : "initial";

            if (click) {
                _this.setConfig(m);
            }
        };

        this.c.onmouseup = function () {
            click = false;
        }
    }

    overButton(m) {
        return Math.pow((m.x - this.button.x), 2) + Math.pow((m.y - this.button.y), 2) < Math.pow(CONFIG_BUTTON_RADIUS, 2)
    }


    update() {
        this.clear();

        this.ctx.beginPath();
        this.ctx.moveTo(this.button.x, this.button.y);
        this.ctx.lineTo(this.halfWidth, this.halfHeight);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, CONFIG_BUTTON_RADIUS, 0, 2 * Math.PI, false);
        this.ctx.fill();

        $(this.data['xHref']).innerHTML = this.data.x;
        $(this.data['yHref']).innerHTML = this.data.y;
    }

    setConfig(m) {
        this.button = m;
        this.buttonToConfig();
        this.update();
    }

    dataF(x) {
        return parseFloat(this.c.dataset[x]);
    }

    get data() {
        return this.c.dataset;
    }

    buttonToConfig() {
        this.data.x = ((this.button.x / this.c.width) * ( this.dataF('maxX') - this.dataF('minX') )) + this.dataF('minX');
        this.data.y = this.dataF('maxY') - ((this.button.y / this.c.height) * ( this.dataF('maxY') - this.dataF('minY') ) + this.dataF('minY'));

        this.data.x = Math.max(Math.min(this.data.x, this.dataF('maxX')), this.dataF('minX'));
        this.data.y = Math.max(Math.min(this.data.y, this.dataF('maxY')), this.dataF('minY'));

        this.data.x = (this.data['xInt'] == 'true') ? Math.round(this.dataF('x')) : round(this.dataF('x'), 100);
        this.data.y = (this.data['yInt'] == 'true') ? Math.round(this.dataF('y')) : round(this.dataF('y'), 100);
    }

    get configToButton() {
        return {
            x: (this.data.x - this.dataF('minX')) / (this.dataF('maxX') - this.dataF('minX')) * (this.c.width),
            y: this.c.height - ((this.data.y - this.dataF('minY')) / (this.dataF('maxY') - this.dataF('minY')) * (this.c.height))
        }
    }
}

class Path {
    constructor(p) {
        this.p = p;
    }

    clear() {
        this.p = [];
    }

    map(fn) {
        return this.p.map(fn);
    }

    push(c) {
        this.p.push(c);
    }

    trace(canvas) {
        canvas.trace(this.p);
    }

    get neighbour() {
        let p = this.p,
            a = rand(0, p.length - 1),
            b = rand(0, p.length - 1),
            tmp = p[a];

        p[a] = p[b];
        p[b] = tmp;

        return new Path(p);
    }

    get object() {
        return this.p.map((c) => {
            return {'x': c[0], 'y': c[1]}
        })
    }

    get length() {
        return this.p.reduce((acc, val, i) => {
            return acc + dist(val, this.p[(i + 1) % this.p.length]);
        }, 0).toFixed(3);
    }

    static fromObject(o) {
        return new Path(o.map((c) => [c.x, c.y]));
    }

    static random(coord) {
        return new Path(coord.sort(() => {
            return 0.5 - Math.random();
        }));
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const canvas = new MainCanvas("c"),
        result = new ResultCanvas("result"),
        config = $$("config-canvas").map((c) => {
            return new ConfigCanvas(c.id)
        });

    $("reset").onclick = () => {
        canvas.reset();
        result.hide();
    };


    $$("random").forEach((c) => {
        c.onclick = () => {
            canvas.random(parseInt(c.dataset['points'], 10) % 200);
            result.hide();
        };
    });

    let solve = (endpoint, input, output, loading) => {
        return () => {
            if (canvas.coordinates.length > 3) {
                clear_timeout();
                loading();

                $post(endpoint, canvas.solver[input], (data) => {
                    output(data);
                }, (response) => {
                    clear_timeout();
                    canvas.redraw();
                    error(canvas.c, response);
                });
            }
            else {
                error(canvas.c, "Please define at least 4 coordinates");
            }
        }
    };

    $("SA").onclick = solve(ENDPOINTS.TSP_SA, "sa", (data) => {
        result.output_sa(canvas, data);
    }, () => {
        canvas.loading_sa(result);
    });

    $("LBS").onclick = solve(ENDPOINTS.TSP_LBS, "lbs", (data) => {
        result.output_lbs(canvas, data);
    }, () => {
        canvas.loading_lbs();
        result.loading_lbs();
    });

});
