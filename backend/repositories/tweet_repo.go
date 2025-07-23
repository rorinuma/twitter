package repositories

import (
	"context"
	"fmt"
	"log"

	"github.com/goccy/go-json"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rorinuma/twitter/db"
	"github.com/rorinuma/twitter/models"
	"github.com/rorinuma/twitter/utils"
)

func CreateTweet(ctx context.Context, input models.CreateTweetInput) (*models.Tweet, error) {
	query := `
	INSERT INTO tweets (
		user_id, content, in_reply_to_tweet_id, original_tweet_id,
		media_urls, replies_count, likes_count, 
		retweets_count, views_count, bookmarks_count, created_at, updated_at
	)
	VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0, 0, NOW(), NOW())
	RETURNING id, user_id, content, in_reply_to_tweet_id, original_tweet_id,
	media_urls, replies_count, likes_count, retweets_count, views_count, bookmarks_count,
	created_at, updated_at
	`

	var tweet models.Tweet
	err := db.Pool.QueryRow(
		ctx,
		query,
		input.UserID,
		input.Content,
		input.InReplyToTweetID,
		input.OriginalTweetID,
		input.MediaURLs,
	).Scan(&tweet.ID, &tweet.UserID, &tweet.Content, &tweet.InReplyToTweetID, 
		&tweet.OriginalTweetID, &tweet.MediaURLs, &tweet.RepliesCount, &tweet.LikesCount,
		&tweet.RetweetsCount, &tweet.ViewsCount, &tweet.BookmarksCount,
		&tweet.CreatedAt, &tweet.UpdatedAt)

	if err != nil {
		return nil, err
	}

	if input.OriginalTweetID != nil {
		_, err := db.Pool.Exec(ctx, `
			UPDATE tweets
			SET retweets_count = retweets_count + 1
			WHERE id = $1
		`, input.OriginalTweetID)
		if err != nil {
			return nil, err
		}
	}

	if input.InReplyToTweetID != nil {
		_, err := db.Pool.Exec(ctx, `
			UPDATE tweets
			SET replies_count = replies_count + 1
			WHERE id = $1
		`, input.InReplyToTweetID)
		if err != nil {
			return nil, err
		}
	}

	return &tweet, nil
}


func DeleteTweet(ctx context.Context, tweetID string, userID string) (*uuid.UUID, error) {
	query := `
		DELETE FROM tweets WHERE id = $1 AND user_id = $2 RETURNING id, in_reply_to_tweet_id, original_tweet_id
	`

	var deletedID uuid.UUID 
	var inReplyTo, originalTweetID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(&deletedID, &inReplyTo, &originalTweetID)
	if err == nil {
		return nil, err
	}

	if inReplyTo != nil {
		_, err := db.Pool.Exec(ctx, `
			UPDATE tweets
			SET replies_count = GREATEST(replies_count - 1, 0)
			WHERE id = $1
		`, *inReplyTo)
		if err != nil {
			return nil, err
		}
	}

	if originalTweetID != nil {
		_, err := db.Pool.Exec(ctx, `
			UPDATE tweets
			SET retweets_count = GREATEST(retweets_count - 1, 0)
			WHERE id = $1
		`, *originalTweetID)
		if err != nil {
			return nil, err
		}
	}
	return &deletedID, nil
}

func DeleteRetweet(ctx context.Context, originalTweetID, userID string) (*uuid.UUID, *int, error) {
	query := `
		DELETE FROM tweets WHERE original_tweet_id = $1 AND user_id = $2 
		AND content = ''
		RETURNING original_tweet_id
	`
	var origTweetID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, originalTweetID, userID).Scan(&origTweetID)
	if err != nil {
		return nil, nil, err
	}

	var newCount *int
	err = db.Pool.QueryRow(ctx, `
		UPDATE tweets
		SET retweets_count = GREATEST(retweets_count - 1, 0)
		WHERE id = $1
		RETURNING retweets_count
	`, originalTweetID).Scan(&newCount)
	if err != nil {
		return nil, nil, err
	}

	return origTweetID, newCount, nil
}

func LikeTweet(ctx context.Context, tweetID string, userID string) (*uuid.UUID, error) {
	query := `
  	INSERT INTO likes (tweet_id, user_id)
  	VALUES ($1, $2)
  	RETURNING id
	`
	var likedTweetID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(&likedTweetID)

	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	if err != pgx.ErrNoRows {
		_, err = db.Pool.Exec(ctx, `
			UPDATE tweets 
			SET likes_count = likes_count + 1
			WHERE id = $1
			`, tweetID)
		if err != nil {
			return nil, err
		}
	}

	return likedTweetID, nil
}

func UnlikeTweet(ctx context.Context, userID, tweetID string) (*uuid.UUID, error) {
	query := `
		DELETE FROM likes
		WHERE user_id = $1 AND tweet_id = $2
		RETURNING tweet_id	
	`

	var deletedID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, userID, tweetID).Scan(&deletedID)

	if err != nil {
		return nil, err
	}
	
	_, err = db.Pool.Exec(ctx, `
		UPDATE tweets
		SET likes_count = GREATEST(likes_count - 1, 0)
		WHERE id = $1
	`, tweetID)

	return deletedID, nil
}

func ViewTweet(ctx context.Context, tweetID, userID string) (*uuid.UUID, error) {
	query := `
		INSERT INTO views (
			user_id, tweet_id
		)
		VALUES ($1, $2)
		RETURNING id
	`

	var id *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, userID, tweetID).Scan(&id)
	if err != nil {
		return nil, err
	}

	_, err = db.Pool.Exec(ctx, `
		UPDATE tweets
		SET views_count = GREATEST(views_count + 1, 0)
		WHERE id = $1
	`, tweetID)

	if err != nil {
		return nil, err
	}

	return id, nil
}

func BookmarkTweet(ctx context.Context, tweetID, userID string) (*uuid.UUID, error) {
	query := `
		INSERT INTO bookmarks (
			tweet_id, user_id
		)
		VALUES ($1, $2)
		RETURNING id
	`
	var bookmarkID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(&bookmarkID)

	if err != nil {
		return nil, err
	}

	_, err = db.Pool.Exec(ctx, `
		UPDATE tweets
		SET bookmarks_count = bookmarks_count + 1
		WHERE id = $1
	`, tweetID)

	if err != nil {
		return nil, err
	}

	return bookmarkID, nil
}

func DeleteTweetBookmark(ctx context.Context, tweetID, userID string) (*uuid.UUID, error) {
	query := `
		DELETE FROM bookmarks 
		WHERE tweet_id = $1 AND user_id = $2
		RETURNING id
	`

	var bookmarkID *uuid.UUID
	err := db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(&bookmarkID)

	if err != nil {
		return nil, err
	}

	_, err = db.Pool.Exec(ctx, `
		UPDATE tweets
		SET bookmarks_count = GREATEST(bookmarks_count - 1, 0)
		WHERE id = $1
	`, tweetID)

	if err != nil {
		return nil, err
	}

	return bookmarkID, nil
}

func GetPostsByID(ctx context.Context, userID *string, ownerID string, limit, offset int) ([]models.Tweet, error) {
  query := utils.BuildTweetQuery("WHERE t.user_id = $2 ORDER BY t.created_at DESC LIMIT $3 OFFSET $4", false)

	rows, err := db.Pool.Query(ctx, query, userID, ownerID, limit + 1, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tweets, err := utils.ScanTweetRow(rows)

	if err != nil {
		return nil, err 
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetReplies(ctx context.Context, userID *string, ownerID string, limit, offset int) ([]models.Tweet, error) {
  query := utils.BuildTweetQuery(`
		WHERE t.user_id = $2 AND t.in_reply_to_tweet_id IS NOT NULL
		ORDER BY t.created_at DESC
		LIMIT $3 OFFSET $4
	`, false)

	rows, err := db.Pool.Query(ctx, query, userID, ownerID, limit + 1, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tweets, err := utils.ScanTweetRow(rows)

	if err != nil {
		return nil, err 
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetLiked(ctx context.Context, userID *string, ownerID string, limit, offset int) ([]models.Tweet, error) {
  query := utils.BuildTweetQuery(`
		JOIN likes l ON l.tweet_id = t.id
		WHERE l.user_id = $2
		ORDER BY t.created_at DESC
		LIMIT $3 OFFSET $4
	`, false)

	rows, err := db.Pool.Query(ctx, query, userID, ownerID, limit + 1, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tweets, err := utils.ScanTweetRow(rows)

	if err != nil {
		return nil, err 
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetTweets(ctx context.Context, userID string, limit int, offset int) ([]models.Tweet, error) {
  query := utils.BuildTweetQuery("ORDER BY t.created_at DESC LIMIT $2 OFFSET $3", false)

	rows, err := db.Pool.Query(ctx, query, userID, limit + 1, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query tweets: %w", err)
	}
	defer rows.Close()


	tweets, err := utils.ScanTweetRow(rows)

	if err != nil {
		return nil, err
	}


	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetFollowingTweets(ctx context.Context, userID string, limit int, offset int) ([]models.Tweet, error) {
  query := utils.BuildTweetQuery(`
		JOIN follows f ON f.following_id = t.user_id
		WHERE f.follower_id = $1
		ORDER BY t.created_at DESC 
		LIMIT $2 OFFSET $3
	`, false)

	rows, err := db.Pool.Query(ctx, query, userID, limit + 1, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query tweets: %w", err)
	}
	defer rows.Close()


	tweets, err := utils.ScanTweetRow(rows)

	if err != nil {
		return nil, err
	}


	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetTweetByID(ctx context.Context, tweetID string, userID *string) (*models.Tweet, error) {
	query := utils.BuildTweetQuery("WHERE t.id = $2 LIMIT 1", true)

    var t, rt, ot, ort models.TweetRow
    var u, ru, ou, oru models.UserRow
		var repliesJSON []byte

    err := db.Pool.QueryRow(ctx, query, userID, tweetID).Scan(

        &t.ID, &t.UserID, &t.Content, &t.InReplyToTweetID, &t.OriginalTweetID, &t.MediaURLs,
        &t.RepliesCount, &t.LikesCount, &t.RetweetsCount, &t.ViewsCount, &t.BookmarksCount,
        &t.CreatedAt, &t.UpdatedAt,

        &u.ID, &u.Username, &u.Email, &u.DisplayName, &u.AvatarURL, &u.BannerURL, &u.IsVerified,
        &u.CreatedAt, &u.UpdatedAt, &u.Following, &u.Followers,

        &rt.ID, &rt.UserID, &rt.Content, &rt.InReplyToTweetID, &rt.OriginalTweetID, &rt.MediaURLs,
        &rt.RepliesCount, &rt.LikesCount, &rt.RetweetsCount, &rt.ViewsCount, &rt.BookmarksCount,
        &rt.CreatedAt, &rt.UpdatedAt,

        &ru.ID, &ru.Username, &ru.Email, &ru.DisplayName, &ru.AvatarURL, &ru.BannerURL, &ru.IsVerified,
        &ru.CreatedAt, &ru.UpdatedAt, &ru.Following, &ru.Followers,

        &repliesJSON,

        &ot.ID, &ot.UserID, &ot.Content, &ot.InReplyToTweetID, &ot.OriginalTweetID, &ot.MediaURLs,
        &ot.RepliesCount, &ot.LikesCount, &ot.RetweetsCount, &ot.ViewsCount, &ot.BookmarksCount,
        &ot.CreatedAt, &ot.UpdatedAt,

        &ou.ID, &ou.Username, &ou.Email, &ou.DisplayName, &ou.AvatarURL, &ou.BannerURL, &ou.IsVerified,
        &ou.CreatedAt, &ou.UpdatedAt, &ou.Following, &ou.Followers,

        &ort.ID, &ort.UserID, &ort.Content, &ort.InReplyToTweetID, &ort.OriginalTweetID, &ort.MediaURLs,
        &ort.RepliesCount, &ort.LikesCount, &ort.RetweetsCount, &ort.ViewsCount, &ort.BookmarksCount,
        &ort.CreatedAt, &ort.UpdatedAt,

        &oru.ID, &oru.Username, &oru.Email, &oru.DisplayName, &oru.AvatarURL, &oru.BannerURL, &oru.IsVerified,
        &oru.CreatedAt, &oru.UpdatedAt, &oru.Following, &oru.Followers,

        &t.IsLiked, &t.IsRetweeted, &t.IsViewed, &t.IsBookmarked, &ot.IsLiked, &ot.IsViewed,  &ot.IsBookmarked,
    )

    if err != nil {
        return nil, fmt.Errorf("failed to query tweet: %w", err)
    }

    user := u.ToUser()
    var replyTo, quotedTweet, retweetedTweet *models.Tweet

    if rt.ID.Valid {
        replyTo = &models.Tweet{}
        *replyTo = rt.ToTweet(ru.ToUser(), nil, nil, nil)
    }

    if ot.ID.Valid {
        var originalReply *models.Tweet
        if ort.ID.Valid {
            originalReply = &models.Tweet{}
            *originalReply = ort.ToTweet(oru.ToUser(), nil, nil, nil)
        }
        originalTweet := ot.ToTweet(ou.ToUser(), originalReply, nil, nil)
        if t.Content.Valid && t.Content.String != "" {
            quotedTweet = &originalTweet
        } else {
            retweetedTweet = &originalTweet
        }
    }

    tweet := t.ToTweet(user, replyTo, quotedTweet, retweetedTweet)

    var replies []models.Tweet
    if err := json.Unmarshal(repliesJSON, &replies); err != nil {
        return nil, fmt.Errorf("failed to unmarshal replies JSON: %w", err)
    }
    tweet.Replies = &replies

    thread, err := GetTweetThreadByID(ctx, tweetID, userID)
    if err != nil {
        log.Printf("Failed to fetch thread for tweet %s: %v", tweetID, err)
    } else {
        tweet.Thread = &thread
    }

    return &tweet, nil
}

func GetTweetThreadByID(ctx context.Context, tweetID string, userID *string) ([]models.Tweet, error) {
	query := utils.BuildThreadQuery()

	rows, err := db.Pool.Query(ctx, query, userID, tweetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tweets, err := utils.ScanTweetRow(rows)
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tweets, nil
}
