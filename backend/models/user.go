package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	PasswordHash string 	`json:"-"`
	DisplayName *string   `json:"display_name,omitempty"`
	Bio         *string   `json:"bio,omitempty"`
	AvatarURL   *string   `json:"avatar_url,omitempty"`
	BannerURL   *string   `json:"banner_url,omitempty"`
	IsVerified  bool      `json:"is_verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateUserInput struct {
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Password 		string 		`json:"-"`
}
