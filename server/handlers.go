package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
	"math/rand"
	"time"
)

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome!")
}


func TspSA(w http.ResponseWriter, r *http.Request) {
	solve(w, r, func(s Solver) Solution {
		return s.Input.SimulatedAnnealing(s.Config[0], int(s.Config[1]))
	})
}


func TspLBS(w http.ResponseWriter, r *http.Request) {
	solve(w, r, func(s Solver) Solution {
		return s.Input.LocalBeamSearch(int(s.Config[0]), int(s.Config[1]));
	});
}


func ClusteringKMeans(w http.ResponseWriter, r *http.Request) {
	solve(w, r, func(s Solver) Solution {
		return s.Input.KMeans(int(s.Config[0]));
	});
}



func solve(w http.ResponseWriter, r *http.Request, cb callback) {
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