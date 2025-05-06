package utils

import "golang.org/x/crypto/bcrypt"

const cost = bcrypt.DefaultCost

func HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	return string(hashed), err
}

func CheckPasswordHash(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}


