package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/repositories"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var input models.CreateUserInput	
	
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid user input", http.StatusBadRequest)
		return
	}
	user, err := repositories.CreateUser(r.Context(), input)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(user)
}
