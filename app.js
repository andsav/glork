(() => {
    'use strict';

    let dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

    let $ = (id) => document.getElementById(id),
        $$ = (cls) => Array.from(document.getElementsByClassName(cls));

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

    const ENDPOINTS = {
        TSP_SA: 'https://go.glork.net/tsp/sa',
        TSP_LSB: 'https://go.glork.net/tsp/lsb'
    };

    const DELAY = 24; // milliseconds between frames

    class CanvasBase {
        constructor(id) {
            this.c = $(id);
            this.ctx = this.c.getContext('2d');
            this.ctx.fillStyle = this.ctx.strokeStyle = "#E6AA68";
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
        };

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
                let x = e.pageX - _this.c.offsetLeft,
                    y = e.pageY - _this.c.offsetTop;

                _this.placePoint(x, y);
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
            while(this.coord.length < points) {
                this.placePoint(rand(15, this.c.width-15), rand(15, this.c.height-15))
            }
        }

        redraw() {
            this.clear();
            this.coord.forEach((c) => {
                this.drawNode(c[0], c[1]);
            });
        }

        reset() {
            clear_timeout();
            this.clear();
            this.path.clear();
        }

        loading(result, path = Path.random( this.coord )) {
            path.trace(this);
            result.sa(path);

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

        getSASolver(cooling) {
            return {
                p: this.path.object,
                config: [ parseFloat(cooling) ]
            }
        }

        get coord() {
            return this.path.p;
        }

    }

    class Result extends CanvasBase {
        constructor(id) {
            super(id);
            this.ctx.font = "14pt Courier New"
        }

        clear_half() {
            this.ctx.clearRect(0, 0, this.halfWidth, this.c.height);
        }

        sa(path, i = 0, max = 0, cooling = 0.98) {
            if(i == 0) {
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

            if(i == 1) {
                this.initial = length;
            }

            if(i != 0) {
                let x = this.halfWidth + this.halfWidth/max * i,
                    y = this.c.height - (length/this.initial) * this.halfHeight*.67,
                    h = this.c.height - y,
                    w = this.halfWidth/max,
                    y2 = this.halfHeight - t * this.halfHeight,
                    h2 = this.halfHeight - y2;

                this.ctx.fillRect(x, y, w, h);
                this.ctx.fillRect(x, y2, w, h2);
            }

            this.ctx.fillText("    T°: " + (t == 1 ? "1.0000000" : String(t)), 20, 26);
            this.ctx.fillText("Length: " + String(length), 20, this.halfHeight + 26);
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

    let output_solution = (canvas, result, solution, i) => {
        if(i >= solution.length) {
            return 0;
        } else {
            let p = Path.fromObject(solution[i]);
            p.trace(canvas);
            result.sa(p, i, solution.length);

            setTimeout(function() {
                output_solution(canvas, result, solution, i+1)
            }, DELAY);
            return 0;
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const canvas = new Canvas("c"),
              result = new Result("result");

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

        $("SA").onclick = () => {
            if(canvas.coord.length > 3) {
                clear_timeout();
                canvas.loading(result);
                result.show();

                $post(ENDPOINTS.TSP_SA, canvas.getSASolver(0.97), (data) => {
                    clear_timeout();
                    output_solution(canvas, result, data, 1);
                }, (response) => {
                    clear_timeout();
                    canvas.redraw();
                    error(canvas.c, response);
                });
            }
            else {
                error(canvas.c, "Please define at least 4 coordinates");
            }
        };

        /*
        $("LBS").onclick = () => {
            clear_timeout();
        }
        */
    });
})();
