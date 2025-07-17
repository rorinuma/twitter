package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7"
	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/repositories"

	"github.com/rorinuma/twitter/utils"
)

func CreateTweet(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	replyToStr := query.Get("replyTo")
	quoteToStr := query.Get("quoteTo")
	retweetedTweetIDStr := query.Get("retweetedTweetID")

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		log.Printf("Failed to parse multipart form: %v", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	text := r.FormValue("text")
	replyPermission := r.FormValue("replyPermission")
	mentionedUsers := r.MultipartForm.Value["mentionedUsers"]
	var replyTo *uuid.UUID
	if replyToStr != "" {
		parsed, err := uuid.Parse(replyToStr)
		if err != nil {
			log.Printf("Error while parsing the replyTo uuid: %v", err)
		} else {
			replyTo = &parsed
		}
	}

	var originalTweetID *uuid.UUID
	if quoteToStr != "" {
		parsed, err := uuid.Parse(quoteToStr)
		if err != nil {
			log.Printf("Error while parsing the replyTo uuid: %v", err)
		} else {
			originalTweetID = &parsed
		}
	}

	if retweetedTweetIDStr != "" && originalTweetID == nil {
		parsed, err := uuid.Parse(retweetedTweetIDStr)
		if err != nil {
			log.Printf("Error while parsing the replyTo uuid: %v", err)
		} else {
			originalTweetID = &parsed
		}
	}


	files := r.MultipartForm.File["files"]

	var mediaURLs []string

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			log.Printf("Failed to open file: %v", err)
			continue
		}
		defer file.Close()

		objectName := fmt.Sprintf("tweets/%d_%s", time.Now().UnixNano(), fileHeader.Filename)
		contentType := fileHeader.Header.Get("Content-Type")

		uploadInfo, err := utils.MinioClient.PutObject(r.Context(), "tweets", objectName, file, fileHeader.Size, minio.PutObjectOptions{
			ContentType: contentType,
		})
		if err != nil {
			log.Printf("Failed to upload to MinIO: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			continue
		}

		publicURL := fmt.Sprintf("http://localhost:9000/%s/%s", uploadInfo.Bucket, uploadInfo.Key)
		mediaURLs = append(mediaURLs, publicURL)
	}

	userIDStr, ok := utils.GetUserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusUnauthorized)
		return
	}

	input := models.CreateTweetInput{
		UserID:           userID,
		Content:          &text,
		InReplyToTweetID: replyTo,
		ReplyPermission:  replyPermission,
		OriginalTweetID: 	originalTweetID,
		MentionedUsers:   &mentionedUsers,
		MediaURLs:        &mediaURLs,
	}

	tweet, err := repositories.CreateTweet(r.Context(), input)
	if err != nil {
		log.Printf("Failed to create tweet: %v", err)
		http.Error(w, "Failed to create tweet", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(tweet)
}

func GetTweets(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	pageStr := query.Get("page")
	limitStr := query.Get("limit")

	page := 1
	limit := 10

	if p, err := strconv.Atoi(pageStr); err == nil && p > 0{
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}

	offset := (page - 1) * limit
	
	id, ok := utils.GetUserIDFromContext(r.Context())
	
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tweets, err := repositories.GetTweets(r.Context(), id, limit + 1, offset)
	if err != nil {
		log.Printf("Failed to get tweets: %v", err)
		http.Error(w, "Failed to get tweets", http.StatusInternalServerError)
		return
	}

	hasMore := false
	if len(tweets) > limit {
		hasMore = true
		tweets = tweets[:limit]
	}

	response := map[string]interface{}{
		"tweets": tweets,
		"hasMore": hasMore,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func GetTweetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var userID *string	
	userIDStr, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		userID = nil
	} else  {
		userID = &userIDStr
	}

	tweet, err := repositories.GetTweetByID(r.Context(), id, userID)
	if err != nil {
		log.Printf("Failed to get a tweet: %v", err)
		http.Error(w, "Failed to get a tweet", http.StatusInternalServerError)
		return
	}

	response := models.StatusResponse{
		Tweet:   tweet,
		Message: "Status received successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func LikeTweet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tweetID := vars["id"]
	userID, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := repositories.LikeTweet(r.Context(), tweetID, userID)
	if err != nil {
		log.Printf("Failed to like a tweet: %v", err)
		http.Error(w, "Failed to like a tweet", http.StatusInternalServerError)
		return
	}

	var response = map[string]string{
		"message": "Tweet liked",
		"tweetLiked": id.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func UnlikeTweet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tweetID := vars["id"]

	userID, ok := utils.GetUserIDFromContext(r.Context())

	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	fmt.Printf("outer tweetID: %v, outer userID: %v", tweetID, userID)

	deletedID, err := repositories.UnlikeTweet(r.Context(), userID, tweetID)

	if err != nil {
		log.Printf("Error unliking a tweet: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"message": "Tweet successfully unliked",
		"deletedId": deletedID.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func DeleteTweet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	userID, ok := utils.GetUserIDFromContext(r.Context())
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	deletedID, err := repositories.DeleteTweet(r.Context(), id, userID)

	if err != nil {
		log.Printf("Failed to delete a tweet: %v", err)
		http.Error(w, "Failed to delete a tweet", http.StatusInternalServerError)
		return
	}

	log.Printf("Tweet deleted: %v", deletedID)

	response := map[string]string{
		"message": "Tweet successfully deleted",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func DeleteRetweet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	originalTweetID := vars["id"]

	userID, ok := utils.GetUserIDFromContext(r.Context())
	if !ok {
		log.Println("User is unauthorized")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	origTweetID, retweetsCount, err := repositories.DeleteRetweet(r.Context(), originalTweetID, userID)
	if err != nil {
		log.Printf("Failed to delete a retweet: %v", err)
		http.Error(w, "Failed to delete a repost", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Repost deleted successfully",
		"originalTweetId": origTweetID.String(),
		"retweetsCount": retweetsCount,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}
