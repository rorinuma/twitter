package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/utils"
)

func CreateUser(ctx context.Context, input models.CreateUserInput) (*models.User, error) {
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, fmt.Errorf("Failed to hash password: %w", err)
	}

	query := `INSERT INTO users (
		username, display_name, email, password_hash 
	)
	VALUES ($1, $1, $2, $3)
	RETURNING  id
	`

	var userID uuid.UUID
	err = db.Pool.QueryRow(ctx, query, input.Username, input.Email, hashedPassword).Scan(&userID)
	if err != nil {
		return nil, fmt.Errorf("Failed to create user: %w", err)
	}

	user := &models.User{
		ID: userID,
	}

	return user, nil
}

func FindOneByID(ctx context.Context, id string) (*models.User, error) {
	query := `
	SELECT id, username, email, display_name, bio, avatar_url,
	banner_url, is_verified, created_at, updated_at,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.following_id WHERE f.follower_id = u.id) as following,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.follower_id WHERE f.following_id = u.id) as followers
	FROM users u
	WHERE u.id = $1
	`

	user := &models.User{}
	err := db.Pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Username,
		&user.Email, &user.DisplayName, &user.Bio, &user.AvatarURL, &user.BannerURL,
		&user.IsVerified, &user.CreatedAt, &user.UpdatedAt, &user.Following, &user.Followers)

	if err != nil {
		return nil, fmt.Errorf("Failed to find a user: %w", err)
	}
	return user, nil
}

func FindOneByUsername(ctx context.Context, username string) (*models.User, error) {
	query := `
	SELECT id, username, email, display_name, bio, avatar_url,
	banner_url, is_verified, created_at, updated_at,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.following_id WHERE f.follower_id = u.id) as following,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.follower_id WHERE f.following_id = u.id) as followers
	FROM users u
	WHERE u.username = $1
	`

	user := &models.User{}
	err := db.Pool.QueryRow(ctx, query, username).Scan(
		&user.ID, &user.Username,
		&user.Email, &user.DisplayName, &user.Bio, &user.AvatarURL, &user.BannerURL,
		&user.IsVerified, &user.CreatedAt, &user.UpdatedAt, &user.Following, &user.Followers)

	if err != nil {
		return nil, fmt.Errorf("Failed to find a user: %w", err)
	}
	return user, nil
}

func FindOneLogin(ctx context.Context, input models.LoginUserInput) (*models.User, error) {

	query := `
	SELECT id, password_hash FROM users
	WHERE email = $1 OR username = $2
	`

	var userID uuid.UUID
	var passwordHash string
	err := db.Pool.QueryRow(ctx, query, input.EmailOrUsername, input.EmailOrUsername).Scan(&userID, &passwordHash)
	if err != nil {
		return nil, fmt.Errorf("Failed to find a user: %w", err)
	}

	user := &models.User{
		ID:           userID,
		PasswordHash: passwordHash,
	}
	return user, nil
}
