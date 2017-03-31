package main

import (
	"log"
	"net/http"
	"github.com/rs/cors"
)

func main() {
	router := cors.Default().Handler(NewRouter())
	log.Fatal(http.ListenAndServe(":8888", router))
}
