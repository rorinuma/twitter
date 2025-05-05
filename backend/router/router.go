package router

import (
	"github.com/gorilla/mux"
	"github.com/rorinuma/twitter/handlers"
)

func SetupRouter() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/hello", handlers.HelloHandler).Methods("GET")
	return r
}


