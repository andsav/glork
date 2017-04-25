import {COLOR, ENDPOINTS} from '../../lib/constants.js';
import {$, $$, $post, $ready} from '../../lib/$.js';
import {Canvas, SliderCanvas} from '../../lib/canvas.js';
import {collision, in_circle, rand, clear_timeout, round, error} from '../../lib/helpers.js';
import {Socket} from '../../lib/socket.js';

const MIN_CURSOR_RADIUS = 4;
const MAX_CURSOR_RADIUS = 30;
const POINTS_DELAY = 100;

let ws = null;

class MainCanvas extends Canvas {
    constructor(id) {
        super(id);

        this.updating = false;
        this.data = [];

        this.points = [];
        this.cursor_radius = MIN_CURSOR_RADIUS;
        this.updateCursor(MIN_CURSOR_RADIUS);

        let _this = this;
        this.timer = null;
        let m = {x: 0, y: 0};


        this.c.onmousedown = this.c.ontouchstart = function (e) {
            m = _this.mouse(e);

            _this.placePoint(
                round(m.x + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1),
                round(m.y + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1)
            );

            _this.timer = setInterval(function () {
                _this.placePoint(
                    round(m.x + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1),
                    round(m.y + rand(-1 * _this.cursor_radius, _this.cursor_radius), 1)
                );
            }, POINTS_DELAY);
        };

        this.c.onmousemove = this.c.ontouchmove = function (e) {
            m = _this.mouse(e);
            if (m.x < 6 || m.y < 6 || m.x > this.width - 6 || m.y > this.height - 6) {
                clearInterval(_this.timer);
            }
        };

        this.c.onmouseup = this.c.ontouchend = function () {
            if (_this.timer) {
                clearInterval(_this.timer);
            }
        };
    }

    updateCursor(r) {
        this.cursor_radius = r;
        this.c.style.cursor = 'url(\'data:image/svg+xml;utf8,' +
            '<svg fill="none" ' +
            'height="' + r * 4 + '" ' +
            'viewBox="0 0 ' + r * 2 + ' ' + r * 2 + '" ' +
            'width="' + r * 4 + '" ' +
            'xmlns="http://www.w3.org/2000/svg">' +
            '<circle fill-opacity="0.4" fill="black" cx="' + r + '" cy="' + r + '" r="' + r + '" stroke="none" stroke-width="1" />' +
            '</svg>\') ' + r * 2 + ' ' + r * 2 + ', auto';
    }

    placePoint(x, y) {
        if(this.updating) {
            this.stopUpdating();
        }

        if (!collision(this.points, [x, y], 7)) {
            this.points.push([x, y]);
            this.placeNode(x, y, true, 6);
        }
    }

    redraw() {
        this.clear();
        this.ctx.fillStyle = COLOR.DEFAULT;
        this.points.forEach((p) => {
            this.placeNode(p[0], p[1], true, 6);
        });
    }

    reset() {
        clear_timeout();
        this.stopUpdating();
        this.clear();
        this.points = [];
    }

    updateKMS(data) {
        this.updating = true;
        this.clear();

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        data['c'].forEach((c) => {
            this.drawCircle(c.x, c.y, 25);
        });


        for(let i=0; i<data['pp'].length; ++i) {
            if(data['pp'][i] != null && data['pp'][i].length != 0) {
                this.ctx.fillStyle = COLOR.CUSTOM[i];
                data['pp'][i].forEach((p) => {
                    this.placeNode(p.x, p.y, true, 6);
                });
            }
        }

        this.ctx.fillStyle = COLOR.DEFAULT;
    }

    updateDBSCAN(data, config, final = false) {
        this.updating = true;
        this.data = data;

        this.clear();

        if(!final) {
            this.ctx.fillStyle = "#16161D";
        }

        for(let i=0; i<data.length; ++i) {
            if(final) {
                this.ctx.fillStyle = COLOR.CUSTOM[i];
            }

            data[i].forEach((p) => {
                this.drawCircle(p.x, p.y, Math.ceil(1.2*config.data['val']));
            });
        }

        this.ctx.fillStyle = final ? "rgba(0, 0, 0, 0.6)" : COLOR.DEFAULT;

        this.points.forEach((p) => {
            this.placeNode(p[0], p[1], true, 6);
        });

        this.ctx.fillStyle = COLOR.DEFAULT;
    }

    stopUpdating() {
        this.updating = false;
        if(ws !== null) {
            ws.close();
        }
        this.redraw();
    }

    object(config) {
        return {
            'p': this.points.map((c) => {
                return {'x': c[0], 'y': c[1]}
            }),
            'config': [ parseFloat(config.data['val']) ]
        };
    }
}

class CursorSlider extends SliderCanvas {

    constructor(id, canvas) {
        super(id, function (c) {
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
        let v = (m.x - 20) / (this.width - 40) * (MAX_CURSOR_RADIUS - MIN_CURSOR_RADIUS) + MIN_CURSOR_RADIUS;
        let r = Math.max(MIN_CURSOR_RADIUS, Math.min(MAX_CURSOR_RADIUS, v));
        this.canvas.updateCursor(r);
        this.button = {
            x: Math.max(20, Math.min(this.width - 20, m.x)),
            y: this.halfHeight,
            r: 2 * r
        };
        this.update();
    }

    update() {
        this.clear();

        // Line
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.halfHeight);
        this.ctx.lineTo(this.width - 20, this.halfHeight);
        this.ctx.stroke();

        // Cursor
        this.ctx.fillStyle = COLOR.WHITE;
        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();

        // Indicator
        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, this.button.r, 0, 2 * Math.PI);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.ctx.fill();
    }
}

class ConfigSlider extends SliderCanvas {
    constructor(id) {
        super(id, function (c) {
            return {
                x: c.buttonToConfig,
                y: c.halfHeight,
                r: MIN_CURSOR_RADIUS * 2
            };
        });
    }

    overButton(m) {
        return in_circle(m, this.button, this.button.r);
    }

    setConfig(m) {
        this.button.x = Math.max(20, Math.min(this.width - 20, m.x));
        this.data['val'] = round(
            (this.dataF('max') - this.dataF('min')) * (this.button.x -20)/(this.width - 40) + this.dataF('min'),
            (this.data['int'] == 'true' ? 1 : 1000)
        );

        this.button.x = this.buttonToConfig;

        this.update();
    }

    update() {
        this.clear();

        // Line
        this.ctx.beginPath();
        this.ctx.moveTo(20, this.halfHeight);
        this.ctx.lineTo(this.width - 20, this.halfHeight);
        this.ctx.stroke();

        // Cursor
        this.ctx.fillStyle = COLOR.WHITE;
        this.ctx.beginPath();
        this.ctx.arc(this.button.x, this.button.y, this.button.r, 0, 2 * Math.PI);
        this.ctx.fill();

        // Indicator
        let text = String(this.data['var'] + " = " + this.dataF('val'));
        let offset = this.ctx.measureText(text).width;
        this.ctx.fillText(text, this.button.x - offset/2, this.halfHeight + 22);
    }

    get buttonToConfig() {
        return (this.dataF('val') - this.dataF('min'))/(this.dataF('max') - this.dataF('min')) * (this.width - 40) + 20;
    }
}

$ready(() => {
    const canvas = new MainCanvas("c"),
        cursorSlider = new CursorSlider("cursor-slider", canvas),
        kSlider = new ConfigSlider("cursor-k"),
        eSlider = new ConfigSlider("cursor-e");

    $("reset").onclick = () => {
        canvas.reset();
    };

    $("lloyd").onclick = () => {
        let data = canvas.object(kSlider);
        if(canvas.points.length < 5) {
            error(canvas.c, "Please define at least 5 points");
        } else if(data['config'][0] > data['p'].length) {
            error(canvas.c, "More clusters than number of points defined");
        } else {
            ws = new Socket(
                ENDPOINTS.CLUSTERING_KMEANS,
                function(d) {
                    canvas.updateKMS(d);
                },
                data);
        }
    };

    $("dbscan").onclick = () => {
        if(canvas.points.length < 5) {
            error(canvas.c, "Please define at least 5 points");
        } else {
            ws = new Socket(
                ENDPOINTS.CLUSTERING_DBSCAN,
                function(d) {
                    canvas.updateDBSCAN(d, eSlider);
                },
                canvas.object(eSlider),
                function() {
                    canvas.updateDBSCAN(canvas.data, eSlider, true);
                });
        }
    };

});