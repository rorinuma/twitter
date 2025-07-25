package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/models"
)

func GetNotifications(ctx context.Context, userID string) ([]models.Notification, error) {
	query := `
		SELECT 
			n.id, n.type, n.is_read, n.created_at,
			json_build_object('id', a.id, 'display_name', a.display_name, 'avatar_url', a.avatar_url) AS actor,
			COALESCE(json_build_object('id', t.id, 'content', t.content), 'null') AS tweet 
		FROM notifications n
		JOIN users a ON a.id = n.actor_id
		LEFT JOIN tweets t ON t.id = n.tweet_id
		WHERE n.user_id = $1
		ORDER BY n.created_at DESC
		LIMIT 20
	`

	rows, err := db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch notifications: %w", err)
	}
	defer rows.Close()

	var notifications []models.Notification

	for rows.Next() {
		var n models.Notification
		var actorJSON []byte
		var tweetJSON []byte

		err := rows.Scan(&n.ID, &n.Type, &n.IsRead, &n.CreatedAt, &actorJSON, &tweetJSON)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}

		err = json.Unmarshal(actorJSON, &n.Actor)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal actor: %w", err)
		}

		if string(tweetJSON) != "null" {
			var tweet models.Tweet
			err = json.Unmarshal(tweetJSON, &tweet)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal tweet: %w", err)
			}
			n.Tweet = &tweet
		}

		notifications = append(notifications, n)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return notifications, nil
}

func InsertNotificationToTweet(ctx context.Context, tweetID, actorID uuid.UUID, notifType models.NotificationType) error {
	var tweetOwnerId uuid.UUID
	err := db.Pool.QueryRow(ctx, `SELECT user_id from tweets WHERE id = $1`, tweetID).Scan(&tweetOwnerId)

	if err != nil {
		return fmt.Errorf("failed to fetch tweet owner: %w", err)
	}

	if &tweetOwnerId == &actorID {
		return nil
	}

	query := `
		INSERT INTO notifications (
			user_id, actor_id, type, tweet_id
		) 
		VALUES ($1, $2, $3, $4)
		RETURNING id	
	`

	var insertedID uuid.UUID 
	err = db.Pool.QueryRow(ctx, query, tweetOwnerId, actorID, notifType, tweetID).Scan(&insertedID)
	
	if err != nil {
		return fmt.Errorf("failure inserting notification %w", err)
	}

	return nil
}
