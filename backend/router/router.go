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

	protected := r.PathPrefix("/protected").Subrouter()
	soft := r.PathPrefix("/soft").Subrouter()
	soft.Use(utils.OptionalJWTMiddleware)
	protected.Use(utils.JWTMiddleware)

	soft.HandleFunc("/status/{id}", handlers.GetTweetByID).Methods("GET")
	protected.HandleFunc("/tweets/foryou", handlers.GetTweets).Methods("GET")
	protected.HandleFunc("/tweets/create", handlers.CreateTweet).Methods("POST")
	protected.HandleFunc("/tweets/like/{id}", handlers.LikeTweet).Methods("POST")
	protected.HandleFunc("/tweets/delete/{id}", handlers.DeleteTweet).Methods("DELETE")
	protected.HandleFunc("/me", handlers.Me).Methods("POST")
	return r
}
