package repositories

import (
	"context"

	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/models"
)

func CreateTweet(ctx context.Context, input models.CreateTweetInput) (*models.Tweet, error) {
	 query := `
		INSERT INTO tweets (
			user_id, content, in_reply_to_tweet_id, original_tweet_id,
			is_retweet, media_urls, likes_count, retweet_count, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, 0, 0, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	var tweet models.Tweet
	err := db.Conn.QueryRow(
		ctx,
		query,
		input.UserID,
		input.Content,
		input.InReplyToTweetID,
		input.OriginalTweetID,
		input.MediaURLs,
		).Scan(&tweet.ID, &tweet.CreatedAt, &tweet.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &tweet, nil
	
}
