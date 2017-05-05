package main

import (
	"encoding/json"
	"net/http"
	"io"
	"io/ioutil"
	"log"
	"github.com/gorilla/websocket"
	"github.com/gorilla/mux"
)

type SingleCallback func(Solver) interface{}

type SocketCallback func(Solver, *websocket.Conn) bool

func Index(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "http://glork.net", 301)
}

func NotesList(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetNotesList());
}

func NotesSingle(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetNotesSingle(mux.Vars(r)["url"]));
}

func NotesRandom(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetNotesRandom());
}

func NotesTags(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetNotesTags());
}


func TspSA(w http.ResponseWriter, r *http.Request) {
	single_cb(w, r, func(s Solver) interface{} {
		return s.Input.SimulatedAnnealing(s.Config[0], int(s.Config[1]))
	})
}

func TspLBS(w http.ResponseWriter, r *http.Request) {
	single_cb(w, r, func(s Solver) interface{} {
		return s.Input.LocalBeamSearch(int(s.Config[0]), int(s.Config[1]));
	});
}

func ClusteringKMeans(w http.ResponseWriter, r *http.Request) {
	socket(w, r, func(s Solver, socket *websocket.Conn) bool {
		return s.Input.KMeans(int(s.Config[0]), socket)
	})
}

func ClusteringDBSCAN(w http.ResponseWriter, r *http.Request) {
	socket(w, r, func(s Solver, socket *websocket.Conn) bool {
		return s.Input.DBSCAN(s.Config[0], 3, socket)
	})
}

// Single response handler
func single(w http.ResponseWriter, r *http.Request, ret interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(ret); err != nil {
		panic(err)
	}
}

// Single response handler with callback
func single_cb(w http.ResponseWriter, r *http.Request, cb SingleCallback) {
	var input Solver

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))

	if err != nil {
		panic(err)
	}
	if err := r.Body.Close(); err != nil {
		panic(err)
	}
	if err := json.Unmarshal(body, &input); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		w.WriteHeader(422)
		if err := json.NewEncoder(w).Encode(err); err != nil {
			panic(err)
		}
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(cb(input)); err != nil {
		panic(err)
	}
}

// Websocket handler
func socket(w http.ResponseWriter, r *http.Request, cb SocketCallback) {
	var input Solver

	var upgrader = websocket.Upgrader{
		ReadBufferSize:  2048,
		WriteBufferSize: 2048,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("[Socket] upgrade error:", err)
		return
	} else {
		log.Println("[Socket] connected")
	}

	defer socket.Close()

	for {
		messageType, message, err := socket.ReadMessage()
		if err != nil {
			log.Println("[Socket] read err:", err)
			break
		}

		log.Printf("[Socket] received %d-type message", messageType)

		if err := json.Unmarshal(message, &input); err != nil {
			log.Println("[Socket] json unmarshal error:", err)
			break
		}

		if !cb(input, socket) {
			break
		}
	}

	log.Println("[Socket] disconnected")
}

// Send json-encoded data over a web socket
func Send(data interface{}, socket *websocket.Conn) bool {
	ret, err := json.Marshal(data)
	if err != nil {
		log.Println("[Socket] json marshal err:", err)
		return false
	}

	err = socket.WriteMessage(websocket.TextMessage, ret)
	if err != nil {
		log.Println("[Socket] send err:", err)
		socket.Close()
		return false
	}

	return true
}