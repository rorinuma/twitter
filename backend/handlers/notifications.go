package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rorinuma/twitter/repositories"
	"github.com/rorinuma/twitter/utils"
)

func GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		log.Println("Unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	notifications, err := repositories.GetNotifications(r.Context(), userID)

	if err != nil {
		log.Println("Error while getting notifications: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"notifications": notifications,
		"message": "Successfully received notifications",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func ReadNotification(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	notifID := vars["id"]

	userID, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		log.Println("Unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := repositories.ReadNotification(r.Context(), userID, notifID)

	if err != nil {
		log.Println("failed to read notification: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(map[string]string{
		"message": "notification has been successfully read",
	}); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
