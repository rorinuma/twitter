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
		username, email, hashed_password		
	)
	VALUES ($1, $2, $3)
	RETURNING  id
	`

	var userID uuid.UUID
	err = db.Conn.QueryRow(ctx, query, input.Username, input.Email, hashedPassword).Scan(&userID)
	if err != nil {
		return nil, fmt.Errorf("Failed to create user: %w", err)
	}

	user := &models.User{
		ID: userID,
	}

	return user, nil
}
