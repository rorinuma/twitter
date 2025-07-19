package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	DisplayName  *string   `json:"display_name,omitempty"`
	Bio          *string   `json:"bio,omitempty"`
	AvatarURL    *string   `json:"avatar_url,omitempty"`
	BannerURL    *string   `json:"banner_url,omitempty"`
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Following    []string  `json:"following"`
	Followers    []string  `json:"followers"`
}

type UserRow struct {
	ID           pgtype.UUID
	Username     pgtype.Text
	Email        pgtype.Text
	DisplayName  pgtype.Text
	AvatarURL    pgtype.Text
	BannerURL    pgtype.Text
	IsVerified   pgtype.Bool
	CreatedAt    pgtype.Timestamptz
	UpdatedAt    pgtype.Timestamptz
	Following    *[]string
	Followers    *[]string
}

func (u *UserRow) ToUser() User {
	return User{
		ID:          uuid.UUID(u.ID.Bytes),
		Username:    u.Username.String,
		Email:       u.Email.String,
		DisplayName: StringPtrFromPgType(u.DisplayName),
		AvatarURL:   StringPtrFromPgType(u.AvatarURL),
		BannerURL:   StringPtrFromPgType(u.BannerURL),
		IsVerified:  u.IsVerified.Bool,
		CreatedAt:   u.CreatedAt.Time,
		UpdatedAt:   u.UpdatedAt.Time,
		Following:   *u.Following,
		Followers:   *u.Followers,
	}
}

type CreateUserInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginUserInput struct {
	EmailOrUsername string `json:"emailOrUsername"`
	Password        string `json:"password"`
}
