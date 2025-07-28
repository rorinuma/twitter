package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/minio/minio-go/v7"
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
		http.Error(w, "User not found", http.StatusUnauthorized)
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

func SearchDisplayName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	displayName := vars["displayName"]

	users, err := repositories.FindAllByDisplayName(r.Context(), displayName)

	if err != nil {
		log.Println("Failed to get user by username: ", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err = json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
		"message": "Successfully fetched users",
	}); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := utils.GetUserIDFromContext(r.Context())
	
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "User is unauthorized", http.StatusUnauthorized)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Invalid form", http.StatusBadRequest)
		return
	}	

	displayName := r.FormValue("displayName")
	bio := r.FormValue("bio")

	var avatarURL, bannerURL *string

	if avatarFile, avatarHeader, err := r.FormFile("avatar"); err == nil {
		defer avatarFile.Close()

		objectName := fmt.Sprintf("avatars/%d_%s", time.Now().UnixNano(), avatarHeader.Filename)
		contentType := avatarHeader.Header.Get("Content-Type")

		info, err := utils.MinioClient.PutObject(r.Context(), "avatars", objectName, avatarFile, avatarHeader.Size, minio.PutObjectOptions{
			ContentType: contentType,
		})

		if err != nil {
			log.Printf("Failed to upload avatar: %v", err)
			http.Error(w, "Avatar upload failed", http.StatusInternalServerError)
			return
		}

		publicURL := os.Getenv("MINIO_PUBLIC_URL")
		url := fmt.Sprintf("%s/%s/%s", publicURL, info.Bucket, info.Key)
		avatarURL = &url
	}

	if bannerFile, bannerHeader, err := r.FormFile("banner"); err == nil {
		defer bannerFile.Close()

		objectName := fmt.Sprintf("banners/%d_%s", time.Now().UnixNano(), bannerHeader.Filename)
		contentType := bannerHeader.Header.Get("Content-Type")

		info, err := utils.MinioClient.PutObject(r.Context(), "banners", objectName, bannerFile, bannerHeader.Size, minio.PutObjectOptions{
			ContentType: contentType,
		})
		if err != nil {
			log.Printf("Failed to upload banner: %v", err)
			http.Error(w, "Banner upload failed", http.StatusInternalServerError)
			return
		}

		publicURL := os.Getenv("MINIO_PUBLIC_URL")
		url := fmt.Sprintf("%s/%s/%s", publicURL, info.Bucket, info.Key)

		bannerURL = &url
	}

	input := models.UpdateProfileInput{
		UserID:      userID,
		DisplayName: &displayName,
		Bio:         &bio,
		AvatarURL:   avatarURL,
		BannerURL:   bannerURL,
	}

	user, err := repositories.UpdateProfile(r.Context(), input)

	if err != nil {
		log.Println("Failed to update user: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"user": user,
	}); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

func FollowUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]
	
	id, ok := utils.GetUserIDFromContext(r.Context())
	
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := repositories.FollowUser(r.Context(), username, id)
	if err != nil {
		log.Println("Failed to follow user: ", err)
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

func UnfollowUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]
	
	id, ok := utils.GetUserIDFromContext(r.Context())
	
	if !ok {
		log.Println("Unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := repositories.UnfollowUser(r.Context(), username, id)
	if err != nil {
		log.Println("Failed to unfollow user: ", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(map[string]string{
		"message": "Unfollowed successfully",
	}); err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		log.Printf("Failed to write response: %v", err)
	}
}

