package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/repositories"
)

func CreateTweet(w http.ResponseWriter, r *http.Request) {
	var input models.CreateTweetInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	tweet, err := repositories.CreateTweet(r.Context(), input)
	if err != nil {
		http.Error(w, "Failed to create tweet", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(tweet)
}
