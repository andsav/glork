(() => {
    'use strict';

    let dist = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

    let $ = (id) => document.getElementById(id);

    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    };

    let rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    let $post = (url, data, fn) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onload = function() { fn(JSON.parse(this.responseText)); };
        xhr.send(JSON.stringify(data));
    };

    class Canvas {
        constructor(id) {
            this.c = $(id);
            this.ctx = this.c.getContext('2d');
            this.ctx.fillStyle = this.ctx.strokeStyle = "#E6AA68";
            this.ctx.lineWidth = 2;
            this.path = new Path([]);

            let _this = this;

            this.c.onclick = function(e) {
                let x = e.pageX - _this.c.offsetLeft,
                    y = e.pageY - _this.c.offsetTop;

                if(x > 12
                    && x < 500 - 12
                    && y > 12
                    && y < 500 - 12
                    && !_this.path.map((co) => dist(co, [x, y]) > 12).includes(false)) {

                    _this.path.push([x, y]);
                    _this.drawNode(x, y);
                }
            };
        }

        clear() {
            this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        };

        drawNode(x, y) {
            this.ctx.fillRect(x-5, y-5, 10, 10);
        };

        redraw() {
            this.clear();
            this.coord.forEach((c) => {
                this.drawNode(c[0], c[1]);
            });
        }

        reset() {
            this.clear();
            this.path.clear();
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

        get coord() {
            return this.path.p;
        }

    }

    class Path {
        constructor(p) {
            this.p = p;
        }

        shuffle() {
            for (let i = this.p.length; i; i--) {
                let j = Math.floor(Math.random() * i);
                this.p[i - 1] = this.p[j];
                this.p[i - 1] = this.p[j];
            }
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
    }


    let output_solution = (canvas, solution, i) => {

        if(i >= solution.length) {
            return 0;
        } else {
            let p = Path.fromObject(solution[i]);
            p.trace(canvas);
            console.log(p.length);

            setTimeout(function() {
                output_solution(canvas, solution, i+1)
            }, 333);
            return 0;
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const canvas = new Canvas("c");

        $("reset").onclick = () => { canvas.reset() };

        $("SA").onclick = () => {
            console.log(canvas.path);

            $post('https://go.glork.net/tsp/sa', canvas.path.object, (data) => {
                output_solution(canvas, data, 1);
            });
        };
    });
})();
