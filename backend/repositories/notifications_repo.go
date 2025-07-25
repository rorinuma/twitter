package repositories

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

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
