(() => {
    'use strict';

    const ENDPOINTS = {
        TSP_SA: 'https://go.glork.net/tsp/sa',
        TSP_LBS: 'https://go.glork.net/tsp/lbs'
    };

    const DELAY = 24; // milliseconds between frame refresh

    const COLOR = "#E6AA68";

    const FONT = "14pt Courier New";

    const CONFIG_BUTTON_RADIUS = 6;

    let dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

    let $ = (id) => document.getElementById(id),
        $$ = (cls) => Array.from(document.getElementsByClassName(cls));

    let isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n);

    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    };

    let rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    let $post = (url, data, success, error) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onload = function() {
            if(this.status === 200) {
                success(JSON.parse(this.responseText));
            } else {
                error(this.response);
            }
        };
        xhr.send(JSON.stringify(data));
    };

    let error = (elem, err) => {
        let err_msg = $("error_msg");

        elem.classList.add('shake', 'shake-constant');
        err_msg.innerHTML = err;
        err_msg.style.opacity = 1;

        setTimeout(function() {
            elem.classList.remove('shake', 'shake-constant');
        }, 300);

        setTimeout(function() {
            err_msg.style.opacity = 0;
        }, 2000);
    };

    class CanvasBase {
        constructor(id) {
            this.c = $(id);
            this.ctx = this.c.getContext('2d');
            this.ctx.fillStyle = this.ctx.strokeStyle = COLOR;
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
            return this.c.width/2;
        }

        get halfHeight() {
            return this.c.height/2;
        }
    }

    class Canvas extends CanvasBase {
        constructor(id) {
            super(id);

            this.path = new Path([]);
            let _this = this;

            this.c.onclick = function(e) {
                let m = _this.mouse(e);
                _this.placePoint(m.x, m.y);
            };
        }

        placePoint(x, y) {
            if(x > 12
                && x < this.c.width - 12
                && y > 12
                && y < this.c.height - 12
                && !this.path.map((co) => dist(co, [x, y]) > 12).includes(false)) {

                this.path.push([x, y]);
                this.drawNode(x, y);
            }
        }

        drawNode(x, y) {
            this.ctx.fillRect(x-5, y-5, 10, 10);
        }

        random(points) {
            this.reset();
            while(this.coordinates.length < points) {
                this.placePoint(rand(15, this.c.width-15), rand(15, this.c.height-15))
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

        loading(result, path = Path.random( this.coordinates )) {
            path.trace(this);
            result.output_sa_helper(path);

            let _this = this;
            setTimeout(() => { _this.loading(result /*, path.neighbour*/ ); }, DELAY);
        }

        trace(path) {
            this.redraw();
            this.ctx.beginPath();
            this.ctx.moveTo(path[0][0], path[0][1]);
            for(let i=1; i<path.length; ++i) {
                this.ctx.lineTo(path[i][0], path[i][1]);
            }
            this.ctx.lineTo(path[0][0], path[0][1]);
            this.ctx.stroke();
        }

        get solver() {
            return {
                'sa': {
                    p: this.path.object,
                    config: [ parseFloat(0.98) ]
                },
                'lbs': {
                    p: this.path.object,
                    config: [ parseFloat(50) ]
                }
            };
        }

        get coordinates() {
            return this.path.p;
        }

    }

    class Result extends CanvasBase {
        constructor(id) {
            super(id);
            this.ctx.font = FONT
        }

        clear_half() {
            this.ctx.clearRect(0, 0, this.halfWidth, this.c.height);
        }

        output_sa_helper(path, i = 0, max = 0, cooling = 0.98) {
            if(i === 0) {
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

            let t = Math.round(Math.pow(cooling, i) * 10000000) / 10000000,
                length = path.length;

            if(i === 1) {
                this.initial = length;
            }

            if(i !== 0) {
                let x = this.halfWidth + this.halfWidth/max * i,
                    y = Math.max(this.c.height - (length/this.initial) * this.halfHeight*.67, this.halfHeight),
                    h = this.c.height - y,
                    w = this.halfWidth/max,
                    y2 = this.halfHeight - t * this.halfHeight,
                    h2 = this.halfHeight - y2;

                this.ctx.fillRect(x, y, w, h);
                this.ctx.fillRect(x, y2, w, h2);
            }

            this.ctx.fillText("    T°: " + (t === 1 ? "1.0000000" : String(t)), 20, 26);
            this.ctx.fillText("Length: " + String(length), 20, this.halfHeight + 26);
        }

        output_sa(canvas, solution, i = 1) {
            if(i === 1) {
                clear_timeout();
            }
            if(i >= solution.length) {
                return 0;
            } else {
                let p = Path.fromObject(solution[i]);
                p.trace(canvas);
                this.output_sa_helper(p, i, solution.length);

                let _this = this;
                setTimeout(function() {
                    _this.output_sa(canvas, solution, i+1)
                }, DELAY);

                return 0;
            }
        }

        output_lbs(canvas, solution) {
            const max = Path.fromObject(solution[0]).length,
                  min = Path.fromObject(solution[solution.length-1]).length;


        }
    }

    class Config extends CanvasBase
    {
        constructor(id) {
            super(id);

            this.button = this.configToButton;

            this.ctx.lineCap = 'round';
            this.update();

            let _this = this;
            let click = false;

            this.c.onmousedown = function(e) {
                let m = _this.mouse(e);
                if(_this.overButton(m)) {
                    click = true;
                }
            };

            this.c.onmousemove = function(e) {
                let m = _this.mouse(e);
                _this.c.style.cursor = _this.overButton(_this.mouse(e)) ? "pointer" : "initial";

                if(click) {
                    _this.setConfig(m);
                    _this.update();
                }
            };

            this.c.onmouseup = function() {
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

            $(this.data.xHref).innerHTML = Math.round(this.dataF('x') * 100) / 100;
            $(this.data.yHref).innerHTML = Math.round(this.dataF('y') * 100) / 100;
        }

        setConfig(m) {
            this.button = m;
            this.buttonToConfig()
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
        }

        get configToButton() {
            return {
                x: (this.data.x - this.dataF('minX'))/(this.dataF('maxX')- this.dataF('minX')) * (this.c.width),
                y: this.c.height - ((this.data.y - this.dataF('minY'))/(this.dataF('maxY') - this.dataF('minY')) * (this.c.height))
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
                a = rand(0, p.length-1),
                b = rand(0, p.length-1),
                tmp = p[a];

            p[a] = p[b];
            p[b] = tmp;

            return new Path(p);
        }

        get object() {
            return this.p.map( (c) => {
                return {'x': c[0], 'y': c[1]}
            } )
        }

        get length() {
            return this.p.reduce((acc, val, i) => { return acc + dist(val, this.p[(i+1)%this.p.length]); }, 0).toFixed(3);
        }

        static fromObject(o) {
            return new Path(o.map( (c) => [c.x, c.y] ));
        }

        static random(coord) {
            return new Path( coord.sort( () => { return 0.5 - Math.random(); } ));
        }
    }

    let clear_timeout = () => {

        let highestTimeoutId = setTimeout(";");
        for (let i = 0 ; i < highestTimeoutId ; i++) {
            clearTimeout(i);
        }

        $("error_msg").style.opacity = 0;
    };

    document.addEventListener("DOMContentLoaded", () => {
        const canvas = new Canvas("c"),
            result = new Result("result"),
            config = $$("config-canvas").map((c) => { return new Config(c.id) });

        $("reset").onclick = () => {
            canvas.reset();
            result.hide();
        };


        $$("random").forEach((c) => {
            c.onclick = () => {
                canvas.random(parseInt(c.dataset['points'])%200);
                result.hide();
            };
        });

        let solve = (endpoint, input, output) => {
            return () => {
                if(canvas.coordinates.length > 3) {
                    clear_timeout();
                    canvas.loading(result);
                    result.show();

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
        });

        $("LBS").onclick = solve(ENDPOINTS.TSP_LBS, "lbs", (data) => {
            result.output_lbs(canvas, data);
        });

    });
})();