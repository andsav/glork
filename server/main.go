package main

import (
	"log"
	"math/rand"
	"time"
	"net/http"
	"github.com/rs/cors"
)

func main() {
	rand.Seed(time.Now().Unix())

	router := cors.New(
		cors.Options{
			AllowedOrigins: []string{"http://glork.net"},
			AllowCredentials: true,
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		}).Handler(NewRouter())

	log.Print("Starting server at :8888")
	log.Fatal(http.ListenAndServe(":8888", router))
}
