package router

import (
	"github.com/gorilla/mux"
	"github.com/rorinuma/twitter/handlers"
	"github.com/rorinuma/twitter/utils"
)

func SetupRouter() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/signup", handlers.CreateUser).Methods("POST")
	r.HandleFunc("/signin", handlers.LoginUser).Methods("POST")
	r.HandleFunc("/status/{id}", handlers.GetTweetByID).Methods("GET")

	protected := r.PathPrefix("/protected").Subrouter()
	protected.Use(utils.JWTMiddleware)

	protected.HandleFunc("/tweets/foryou", handlers.GetTweets).Methods("GET")
	protected.HandleFunc("/tweets/create", handlers.CreateTweet).Methods("POST")
	protected.HandleFunc("/tweets/delete/{id}", handlers.DeleteTweet).Methods("DELETE")
	protected.HandleFunc("/me", handlers.Me).Methods("POST")
	return r
}
