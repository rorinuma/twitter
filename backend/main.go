package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/router"
	"github.com/rorinuma/twitter/utils"
	"github.com/rs/cors"
)

func main() {
	r := router.SetupRouter()

	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	utils.InitMinio()

	log.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(r)))
}
