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
	soft.HandleFunc("/user/{username}", handlers.GetUserByUsername).Methods("GET")
	soft.HandleFunc("/tweets/posts", handlers.GetPosts).Methods("GET")
	soft.HandleFunc("/tweets/replies", handlers.GetReplies).Methods("GET")
	protected.HandleFunc("/tweets/liked", handlers.GetLiked).Methods("GET")
	protected.HandleFunc("/tweets/foryou", handlers.GetTweets).Methods("GET")
	protected.HandleFunc("/tweets/create", handlers.CreateTweet).Methods("POST")
	protected.HandleFunc("/tweets/like/{id}", handlers.LikeTweet).Methods("POST")
	protected.HandleFunc("/tweets/unlike/{id}", handlers.UnlikeTweet).Methods("DELETE")
	protected.HandleFunc("/tweets/view/{id}", handlers.ViewTweet).Methods("POST")
	protected.HandleFunc("/tweets/bookmark/{id}", handlers.BookmarkTweet).Methods("POST")
	protected.HandleFunc("/tweets/delete-bookmark/{id}", handlers.DeleteTweetBookmark).Methods("DELETE")
	protected.HandleFunc("/tweets/delete/{id}", handlers.DeleteTweet).Methods("DELETE")
	protected.HandleFunc("/tweets/delete-retweet/{id}", handlers.DeleteRetweet).Methods("DELETE")
	protected.HandleFunc("/me", handlers.Me).Methods("POST")
	protected.HandleFunc("/signout", handlers.Signout).Methods("DELETE")
	return r
}
