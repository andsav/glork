import { error } from './helpers.js';

export let Ws = null;

export class Socket {
    constructor(endpoint, receiveFn, initialData = null) {
        if((window["WebSocket"])) {
            if(Ws) {
                Ws.close();
            }

            Ws = new WebSocket(endpoint);

            let _this = this;

            Ws.onopen = function() {
                console.log("Socket connection");
                if(initialData) {
                    _this.send(initialData);
                }
            };

            Ws.onmessage = function(e) {
                let data = JSON.parse(e.data);
                receiveFn(data);
            };

            Ws.onclose = function() {};
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

}