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
		is_retweet, media_urls, replies_count, likes_count, 
		retweets_count, views_count, bookmarks_count, created_at, updated_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 0, 0, NOW(), NOW())
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

func GetTweets(ctx context.Context) ([]models.Tweet, error) {
	query := `
	SELECT id, user_id, content, in_reply_to_tweet_id, original_tweet_id, media_urls,
		replies_count, likes_count, retweets_count, views_count, bookmarks_count,
		created_at, updated_at 
	FROM tweets
	ORDER BY created_at DESC
	`
	rows, err := db.Conn.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tweets []models.Tweet

	for rows.Next() {
		var tweet models.Tweet
		err := rows.Scan(
			&tweet.ID,
			&tweet.UserId,
			&tweet.Content,
			&tweet.InReplyToTweetID,
			&tweet.OriginalTweetID,
			&tweet.MediaURLs,
			&tweet.RepliesCount,
			&tweet.LikesCount,
			&tweet.RetweetsCount,
			&tweet.ViewsCount,
			&tweet.BookmarksCount,
			&tweet.CreatedAt,
			&tweet.UpdatedAt,
			)
		if err != nil {
			return nil, err
		}
		tweets = append(tweets, tweet)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tweets, nil
}

