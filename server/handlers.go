package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
)

type callback func(Solver) Solution


func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome!")
}


func TspSA(w http.ResponseWriter, r *http.Request) {
	tspSolve(w, r, func(s Solver) Solution {
		return s.Input.SimulatedAnnealing(s.Config[0])
	})
}


func TspLBS(w http.ResponseWriter, r *http.Request) {
	tspSolve(w, r, func(s Solver) Solution {
		return s.Input.LocalBeamSearch(int(s.Config[0]));
	});
}


func tspSolve(w http.ResponseWriter, r *http.Request, cb callback) {
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

	if err := json.NewEncoder(w).Encode( cb(input) ); err != nil {
		panic(err)
	}
}