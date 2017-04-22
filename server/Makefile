all:
	go get github.com/gorilla/mux
    go get github.com/gorilla/websocket
	go get github.com/rs/cors
	go build && ./server 2>&1 | tee -a log.txt
