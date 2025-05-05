package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/router"
)

func main() {
	r := router.SetupRouter()

	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	

	log.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
