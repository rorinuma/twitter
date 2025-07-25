package handlers

import (
	"log"
	"net/http"

	"github.com/rorinuma/twitter/utils"
)

func GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		log.Println("Unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}



}
