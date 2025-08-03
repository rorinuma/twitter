package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/ws"
)

func GetNotifications(ctx context.Context, userID string) ([]models.Notification, error) {
	query := `
		SELECT 
			n.id, n.type, n.is_read, n.created_at,
			json_build_object(
        'id', a.id,
        'username', a.username,
        'display_name', a.display_name,
        'avatar_url', a.avatar_url,
      	'following', ARRAY(
          SELECT u2.username
          FROM follows f
          JOIN users u2 ON u2.id = f.following_id
        	WHERE f.follower_id = a.id
        ),
				'followers', ARRAY(
					SELECT u3.username
					FROM follows f
					JOIN users u3 ON u3.id = f.follower_id
					WHERE f.following_id = a.id
				)
			) AS actor,
			CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'content', t.content) ELSE NULL END AS tweet
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

		if tweetJSON != nil {
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
	var tweetOwnerID uuid.UUID
	err := db.Pool.QueryRow(ctx, `SELECT user_id from tweets WHERE id = $1`, tweetID).Scan(&tweetOwnerID)

	if err != nil {
		return fmt.Errorf("failed to fetch tweet owner: %w", err)
	}

	if tweetOwnerID == actorID {
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
	err = db.Pool.QueryRow(ctx, query, tweetOwnerID, actorID, notifType, tweetID).Scan(&insertedID)

	ws.WsManager.NotifyUser(tweetOwnerID.String(), "notification:new", nil)

	if err != nil {
		return fmt.Errorf("failure inserting notification %w", err)
	}

	return nil
}

func InsertFollowNotification(ctx context.Context, actorID, userID string, notifType models.NotificationType) error {
	query := `
		INSERT INTO notifications (
			user_id, actor_id, type
		)
		VALUES ($1, $2, $3)
	`

	_, err := db.Pool.Exec(ctx, query, userID, actorID, notifType)

	ws.WsManager.NotifyUser(userID, "notification:new", nil)

	if err != nil {
		return fmt.Errorf("error inserting notification: %w", err)
	}

	return nil
}

func DeleteTweetNotification(ctx context.Context, actorID, tweetID string, notifType models.NotificationType) error {
	query := `
		DELETE FROM notifications
		WHERE actor_id = $1 AND tweet_id = $2 AND type = $3
	`

	_, err := db.Pool.Exec(ctx, query, actorID, tweetID, notifType)

	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}

	return nil
}

func DeleteFollowNotification(ctx context.Context, actorID, userID string) error {
	query := `
		DELETE FROM notifications
		WHERE actor_id = $1 AND user_id = $2 AND type = $3
	`

	_, err := db.Pool.Exec(ctx, query, actorID, userID, models.NotificationFollow)

	if err != nil {
		return fmt.Errorf("failed to delete follow notification: %w", err)
	}

	return nil
}

func ReadNotification(ctx context.Context, userID, notifID string) error {
	query := `
		UPDATE notifications
		SET is_read = true
		WHERE user_id = $1 AND id = $2
	`

	_, err := db.Pool.Exec(ctx, query, userID, notifID)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}

	return nil
}

func GetNotificationCount(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM notifications
		WHERE user_id = $1 AND is_read = false
	`

	var count int
	err := db.Pool.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}
