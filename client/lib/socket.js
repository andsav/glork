import { error } from './helpers.js';

export let Ws = null;

export class Socket {
    constructor(endpoint, receiveFn, initialData = null, closeFn = function() {}) {
        if((window["WebSocket"])) {
            if(Ws) {
                Ws.onclose = function() {};
                Ws.close();
            }

            Ws = new WebSocket(endpoint);

            let _this = this;

            if(initialData) {
                Ws.onopen = function() {
                    _this.send(initialData);
                };
            }

            Ws.onmessage = function(e) {
                let data = JSON.parse(e.data);
                receiveFn(data);
            };

            Ws.onclose = closeFn;
            window.onbeforeunload = function() {
                Ws.close()
            }

        } else {
            error(document.body, "Your browser does not support WebSockets")
        }
    }

    send(data) {
        Ws.send(JSON.stringify(data));
    }

    close() {
        Ws.onclose = function() {};
        Ws.close();
    }

}