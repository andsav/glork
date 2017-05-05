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

type SingleCallback func(interface{}) interface{}

type SocketCallback func(interface{}, *websocket.Conn) bool

func Index(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "http://glork.net", 301)
}

/*
	Notes
 */
func NotesList(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetAllNotes());
}

func NotesSingle(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetSingleNote(mux.Vars(r)["url"]));
}

func NotesRandom(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetRandomNote());
}

func NotesTags(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetAllTags());
}

func NotesTag(w http.ResponseWriter, r *http.Request) {
	single(w, r, GetNotesByTag(mux.Vars(r)["tag"]));
}

func NotesUpdate(w http.ResponseWriter, r *http.Request) {
	var input NoteData
	single_input(w, r, func(i interface{}) interface{} {
		n, ok := i.(*NoteData); if ok {
			if(n.Id == "") {
				return n.N.Add(n.Password)
			} else {
				return n.N.Update(n.Id, n.Password)
			}
		} else {
			log.Println("Cannot cast to NoteData", i)
			return i
		}
	}, &input);
}

/*
	TSP
 */
func TspSA(w http.ResponseWriter, r *http.Request) {
	var input PointsSolver
	single_input(w, r, func(i interface{}) interface{} {
		s, ok := i.(*PointsSolver); if ok {
			return s.Input.SimulatedAnnealing(s.Config[0], int(s.Config[1]))
		} else {
			log.Println("Cannot cast to PointsSolver", i)
			return i
		}
	}, &input)
}

func TspLBS(w http.ResponseWriter, r *http.Request) {
	var input PointsSolver
	single_input(w, r, func(i interface{}) interface{} {
		s, ok := i.(*PointsSolver); if ok {
			return s.Input.LocalBeamSearch(int(s.Config[0]), int(s.Config[1]));
		} else {
			log.Println("Cannot cast to PointsSolver", i)
			return i
		}
	}, &input);
}

/*
	Clustering
 */
func ClusteringKMeans(w http.ResponseWriter, r *http.Request) {
	var input PointsSolver
	socket(w, r, func(i interface{}, socket *websocket.Conn) bool {
		s, ok := i.(*PointsSolver); if ok {
			return s.Input.KMeans(int(s.Config[0]), socket)
		} else {
			log.Println("Cannot cast to PointsSolver", i)
			return false
		}
	}, &input)
}

func ClusteringDBSCAN(w http.ResponseWriter, r *http.Request) {
	var input PointsSolver
	socket(w, r, func(i interface{}, socket *websocket.Conn) bool {
		s, ok := i.(*PointsSolver); if ok {
			return s.Input.DBSCAN(s.Config[0], 3, socket)
		} else {
			log.Println("Cannot cast to PointsSolver", i)
			return false
		}
	}, &input)
}

// Single response handler
func single(w http.ResponseWriter, r *http.Request, ret interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(ret); err != nil {
		panic(err)
	}
}

// Single response handler with input
func single_input(w http.ResponseWriter, r *http.Request, cb SingleCallback, input interface{}) {
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))

	if err != nil {
		panic(err)
	}
	if err := r.Body.Close(); err != nil {
		panic(err)
	}
	if err := json.Unmarshal(body, input); err != nil {
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
func socket(w http.ResponseWriter, r *http.Request, cb SocketCallback, input interface{}) {
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

		if err := json.Unmarshal(message, input); err != nil {
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