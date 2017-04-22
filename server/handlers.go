package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
	"math/rand"
	"time"
	"log"
	"github.com/gorilla/websocket"
)

type SingleCallback func(Solver) Solution

type SocketCallback func(*websocket.Conn)

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome!")
}


func TspSA(w http.ResponseWriter, r *http.Request) {
	single(w, r, func(s Solver) Solution {
		return s.Input.SimulatedAnnealing(s.Config[0], int(s.Config[1]))
	})
}


func TspLBS(w http.ResponseWriter, r *http.Request) {
	single(w, r, func(s Solver) Solution {
		return s.Input.LocalBeamSearch(int(s.Config[0]), int(s.Config[1]));
	});
}

func ClusteringKMeans(w http.ResponseWriter, r *http.Request) {

	socket(w, r, func(c *websocket.Conn) {
		for {
			mt, message, err := c.ReadMessage()
			if err != nil {
				log.Println("Socket read err:", err)
				break
			}
			log.Printf("Received: %s", message)
			err = c.WriteMessage(mt, message)
			if err != nil {
				log.Println("Socket write err:", err)
				break
			}
		}
	})
}



func single(w http.ResponseWriter, r *http.Request, cb SingleCallback) {
	var input Solver

	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))

	rand.Seed(time.Now().Unix())

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

	if err := json.NewEncoder(w).Encode( cb(input) ); err != nil {
		panic(err)
	}
}

func socket(w http.ResponseWriter, r *http.Request, cb SocketCallback) {
	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Socket upgrade error:", err)
		return
	} else {
		log.Print("Socket connected")
	}


	defer c.Close()

	cb(c)

	log.Print("Socket disconnected")
}