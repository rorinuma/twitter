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

func FindAllByDisplayName(ctx context.Context, displayName string) ([]models.User, error) {
	query := `
	SELECT id, username, email, display_name, bio, avatar_url,
	banner_url, is_verified, created_at, updated_at,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.following_id WHERE f.follower_id = u.id) as following,
	ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.follower_id WHERE f.following_id = u.id) as followers,
	(
	SELECT COUNT(*)
	FROM follows f
	WHERE f.following_id = u.id
	) AS follower_count
	FROM users u
	WHERE u.display_name ILIKE '%' || $1 || '%'
	ORDER BY follower_count DESC
	LIMIT 3
	`

	rows, err := db.Pool.Query(ctx, query, displayName)

	if err != nil {
		return nil, fmt.Errorf("Failed to find a user: %w", err)
	}

	defer rows.Close()

	var users []models.User

	for rows.Next() {
		u := models.User{}
		err := rows.Scan(
			&u.ID, &u.Username, &u.Email, &u.DisplayName, &u.Bio, &u.AvatarURL,
			&u.BannerURL, &u.IsVerified, &u.CreatedAt, &u.UpdatedAt,
			&u.Following, &u.Followers, &u.FollowersCount,
			)
		
		if err != nil {
			return nil, fmt.Errorf("Failed to scan user: %w", err)
		}
		users = append(users, u) 
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("Row iteration error: %w", err)
	}

	if len(users) == 0 {
		return nil, fmt.Errorf("No user found with display name: %s", displayName)
	}


	return users, nil
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

func UpdateProfile(ctx context.Context, input models.UpdateProfileInput) (*models.User, error) {
	query := `
		UPDATE users
		SET
			display_name = COALESCE($1, display_name),
			bio = COALESCE($2, bio),
			avatar_url = COALESCE($3, avatar_url),
			banner_url = COALESCE($4, banner_url),
			updated_at = NOW()
		WHERE id = $5
		RETURNING id, username, email, display_name, bio, avatar_url, banner_url,
		is_verified, created_at, updated_at
	`


	user := &models.User{}
	err := db.Pool.QueryRow(ctx, query,
		input.DisplayName,
		input.Bio,
		input.AvatarURL,
		input.BannerURL,
		input.UserID,
		).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.Bio,
		&user.AvatarURL,
		&user.BannerURL,
		&user.IsVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
		)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func FollowUser(ctx context.Context, username, userID string) (*uuid.UUID, error) {
	var userIDToFollow uuid.UUID
	err := db.Pool.QueryRow(ctx, `
		SELECT id 
		FROM users
		WHERE username = $1
	`, username).Scan(&userIDToFollow)
	if err != nil {
		return nil, fmt.Errorf("failed to find user with username %s: %w", username, err)
	}

	query := `
		INSERT INTO follows (follower_id, following_id)
		VALUES ($1, $2)
		RETURNING follower_id
	`

	var insertedID uuid.UUID
	err = db.Pool.QueryRow(ctx, query, userID, userIDToFollow).Scan(&insertedID)
	if err != nil {
		return nil, fmt.Errorf("failed to insert follow relationship: %w", err)
	}

	return &insertedID, nil
}

func UnfollowUser(ctx context.Context, username, userID string) error {
	var userIDToFollow uuid.UUID
	err := db.Pool.QueryRow(ctx, `
		SELECT id 
		FROM users
		WHERE username = $1
	`, username).Scan(&userIDToFollow)
	if err != nil {
		return fmt.Errorf("failed to find user with username %s: %w", username, err)
	}

	query := `
		DELETE FROM follows
		WHERE follower_id = $1 AND following_id = $2
	`

	_, err = db.Pool.Exec(ctx, query, userID, userIDToFollow)
	if err != nil {
		return fmt.Errorf("failed to delete follow relationship: %w", err)
	}

	return nil
}
