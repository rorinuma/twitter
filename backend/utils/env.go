package utils

import (
	"fmt"
	"net/http"
	"os"
)

func IsProduction() (bool, http.SameSite) {
	sameSite := http.SameSiteNoneMode
	secure := os.Getenv("ENV") == "production"

	fmt.Printf(".env ENV: %v", os.Getenv("ENV"))

	if !secure {
		sameSite = http.SameSiteLaxMode
	}

	return secure, sameSite
}
