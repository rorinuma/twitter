package utils

import (
	"net/http"
	"os"
)

func IsProduction() (bool, http.SameSite) {
	sameSite := http.SameSiteNoneMode
	secure := os.Getenv("ENV") == "production"

	if !secure {
		sameSite = http.SameSiteLaxMode
	}

	return secure, sameSite
}
