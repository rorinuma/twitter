package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/repositories"
	"github.com/rorinuma/twitter/utils"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var input models.CreateUserInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Failed to decode user input: %v", err)

		http.Error(w, "Invalid user input", http.StatusBadRequest)
		return
	}
	user, err := repositories.CreateUser(r.Context(), input)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			log.Printf("Unique constraint violation: %v", err)
			http.Error(w, "User with this email or username already exists", http.StatusConflict)
			return
		}
		log.Printf("Failed to create a user in a database: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

func LoginUser(w http.ResponseWriter, r *http.Request) {
	var input models.LoginUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("Failed to decode user input: %v", err)
		http.Error(w, "Invalid user input", http.StatusBadRequest)
		return
	}
	user, err := repositories.FindOneLogin(r.Context(), input)
	if err != nil {
		log.Printf("User not found: %v", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err = utils.CheckPasswordHash(user.PasswordHash, input.Password)
	if err != nil {
		log.Printf("Bad credentials: %v", err)
		http.Error(w, "Bad credentials", http.StatusBadRequest)
		return
	}

	token, err := utils.CreateToken(user.ID)
	if err != nil {
		log.Printf("Failed to create token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		HttpOnly: true,
		Secure:   false,
		MaxAge:   7 * 24 * 60 * 60,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
	})
}

func Me(w http.ResponseWriter, r *http.Request) {
	id, ok := utils.GetUserIDFromContext(r.Context())
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	user, err := repositories.FindOneByID(r.Context(), id)
	if err != nil {
		log.Println("User not found: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

func GetUserByUsername(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]
	
	user, err := repositories.FindOneByUsername(r.Context(), username)
	if err != nil {
		log.Println("User not found: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(user); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

func Signout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name: "token",
		Value: "",
		Path: "/",
		Expires: time.Unix(0, 0),
		MaxAge: -1,
		HttpOnly: true,
		Secure: false,
		SameSite: http.SameSiteLaxMode,
	})

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}

