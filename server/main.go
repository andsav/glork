package main

import (
	"log"
	"net/http"
	"github.com/rs/cors"
)

func main() {
	router := cors.New(
		cors.Options{
			AllowedOrigins: []string{"https://glork.net"},
			AllowCredentials: true,
		}).Handler(NewRouter())

	log.Fatal(http.ListenAndServe(":8888", router))
}
