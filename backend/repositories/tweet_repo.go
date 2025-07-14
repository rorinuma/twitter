package repositories

import (
	"context"
	"fmt"
	"log"

	"github.com/goccy/go-json"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
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
	RETURNING id, created_at, updated_at
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
	).Scan(&tweet.ID, &tweet.CreatedAt, &tweet.UpdatedAt)
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

func LikeTweet(ctx context.Context, tweetID string, userID string) (*uuid.UUID, error) {
	_, err := db.Pool.Exec(ctx, `
		UPDATE tweets 
		SET likes_count = likes_count + 1
		WHERE id = $1
	`, tweetID)
	if err != nil {
		return nil, err
	}

	query := `
  	INSERT INTO likes (tweet_id, user_id)
  	VALUES ($1, $2)
  	ON CONFLICT (tweet_id, user_id) DO NOTHING
  	RETURNING id
	`
	var likedTweetID *uuid.UUID
	err = db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(&likedTweetID)

	if err != nil && err != pgx.ErrNoRows {
		return nil, err
	}

	return likedTweetID, nil
}

func GetTweets(ctx context.Context, userID string, limit int, offset int) ([]models.Tweet, error) {
	query := `
	SELECT 
		-- Main tweet
		t.id, t.user_id, t.content, t.in_reply_to_tweet_id, t.original_tweet_id, t.media_urls,
		t.replies_count, t.likes_count, t.retweets_count, t.views_count, t.bookmarks_count,
		t.created_at, t.updated_at,
		u.id, u.username, u.email, u.display_name, u.avatar_url, u.banner_url, u.is_verified, 
		u.created_at, u.updated_at,
		ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.following_id WHERE f.follower_id = u.id) as following,
		ARRAY(SELECT u2.username FROM follows f JOIN users u2 ON u2.id = f.follower_id WHERE f.following_id = u.id) as followers,

		-- Reply tweet
		rt.id, rt.user_id, rt.content, rt.in_reply_to_tweet_id, rt.original_tweet_id, rt.media_urls,
		rt.replies_count, rt.likes_count, rt.retweets_count, rt.views_count, rt.bookmarks_count,
		rt.created_at, rt.updated_at,
		ru.id, ru.username, ru.email, ru.display_name, ru.avatar_url, ru.banner_url, ru.is_verified, 
		ru.created_at, ru.updated_at,
		ARRAY(SELECT u3.username FROM follows f JOIN users u3 ON u3.id = f.following_id WHERE f.follower_id = ru.id) as reply_following,
		ARRAY(SELECT u3.username FROM follows f JOIN users u3 ON u3.id = f.follower_id WHERE f.following_id = ru.id) as reply_followers,

		-- Original tweet
		ot.id, ot.user_id, ot.content, ot.in_reply_to_tweet_id, ot.original_tweet_id, ot.media_urls,
		ot.replies_count, ot.likes_count, ot.retweets_count, ot.views_count, ot.bookmarks_count,
		ot.created_at, ot.updated_at,
		ou.id, ou.username, ou.email, ou.display_name, ou.avatar_url, ou.banner_url, ou.is_verified, 
		ou.created_at, ou.updated_at,
		ARRAY(SELECT u4.username FROM follows f JOIN users u4 ON u4.id = f.following_id WHERE f.follower_id = ou.id) as original_following,
		ARRAY(SELECT u4.username FROM follows f JOIN users u4 ON u4.id = f.follower_id WHERE f.following_id = ou.id) as original_followers,

		-- Reply-to of original tweet
		ort.id, ort.user_id, ort.content, ort.in_reply_to_tweet_id, ort.original_tweet_id, ort.media_urls,
		ort.replies_count, ort.likes_count, ort.retweets_count, ort.views_count, ort.bookmarks_count,
		ort.created_at, ort.updated_at,
		oru.id, oru.username, oru.email, oru.display_name, oru.avatar_url, oru.banner_url, oru.is_verified,
		oru.created_at, oru.updated_at,
		ARRAY(SELECT u5.username FROM follows f JOIN users u5 ON u5.id = f.following_id WHERE f.follower_id = oru.id) as original_reply_following,
		ARRAY(SELECT u5.username FROM follows f JOIN users u5 ON u5.id = f.follower_id WHERE f.following_id = oru.id) as original_reply_followers,

		EXISTS (
			SELECT 1
			FROM likes l
			WHERE l.tweet_id = t.id AND l.user_id = $1
		) as is_liked

	FROM tweets t
	JOIN users u ON u.id = t.user_id
	LEFT JOIN tweets rt ON rt.id = t.in_reply_to_tweet_id
	LEFT JOIN users ru ON ru.id = rt.user_id
	LEFT JOIN tweets ot ON ot.id = t.original_tweet_id
	LEFT JOIN users ou ON ou.id = ot.user_id
	LEFT JOIN tweets ort ON ort.id = ot.in_reply_to_tweet_id
	LEFT JOIN users oru ON oru.id = ort.user_id
	ORDER BY t.created_at DESC
	LIMIT $2 OFFSET $3
	`

	rows, err := db.Pool.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query tweets: %w", err)
	}
	defer rows.Close()

	var tweets []models.Tweet

	for rows.Next() {
		var tweet models.Tweet
		var user models.User

		var (
			replyID              pgtype.UUID
			replyUserID          pgtype.UUID
			replyContent         pgtype.Text
			replyInReplyToID     pgtype.UUID
			replyOriginalTweetID pgtype.UUID
			replyMediaURLs       *[]string
			replyRepliesCount    pgtype.Int4
			replyLikesCount      pgtype.Int4
			replyRetweetsCount   pgtype.Int4
			replyViewsCount      pgtype.Int4
			replyBookmarksCount  pgtype.Int4
			replyCreatedAt       pgtype.Timestamptz
			replyUpdatedAt       pgtype.Timestamptz
			replyAuthorID        pgtype.UUID
			replyAuthorUsername  pgtype.Text
			replyAuthorEmail     pgtype.Text
			replyAuthorDisplay   pgtype.Text
			replyAuthorAvatarURL pgtype.Text
			replyAuthorBannerURL pgtype.Text
			replyAuthorVerified  pgtype.Bool
			replyAuthorCreatedAt pgtype.Timestamptz
			replyAuthorUpdatedAt pgtype.Timestamptz
			replyAuthorFollowing *[]string
			replyAuthorFollowers *[]string
		)

		var (
			originalID              pgtype.UUID
			originalUserID          pgtype.UUID
			originalContent         pgtype.Text
			originalInReplyToID     pgtype.UUID
			originalOriginalTweetID pgtype.UUID
			originalMediaURLs       *[]string
			originalRepliesCount    pgtype.Int4
			originalLikesCount      pgtype.Int4
			originalRetweetsCount   pgtype.Int4
			originalViewsCount      pgtype.Int4
			originalBookmarksCount  pgtype.Int4
			originalCreatedAt       pgtype.Timestamptz
			originalUpdatedAt       pgtype.Timestamptz
			originalAuthorID        pgtype.UUID
			originalAuthorUsername  pgtype.Text
			originalAuthorEmail     pgtype.Text
			originalAuthorDisplay   pgtype.Text
			originalAuthorAvatarURL pgtype.Text
			originalAuthorBannerURL pgtype.Text
			originalAuthorVerified  pgtype.Bool
			originalAuthorCreatedAt pgtype.Timestamptz
			originalAuthorUpdatedAt pgtype.Timestamptz
			originalAuthorFollowing *[]string
			originalAuthorFollowers *[]string
		)

		var (
			originalReplyID              pgtype.UUID
			originalReplyUserID          pgtype.UUID
			originalReplyContent         pgtype.Text
			originalReplyInReplyToID     pgtype.UUID
			originalReplyOriginalTweetID pgtype.UUID
			originalReplyMediaURLs       *[]string
			originalReplyRepliesCount    pgtype.Int4
			originalReplyLikesCount      pgtype.Int4
			originalReplyRetweetsCount   pgtype.Int4
			originalReplyViewsCount      pgtype.Int4
			originalReplyBookmarksCount  pgtype.Int4
			originalReplyCreatedAt       pgtype.Timestamptz
			originalReplyUpdatedAt       pgtype.Timestamptz
			originalReplyAuthorID        pgtype.UUID
			originalReplyAuthorUsername  pgtype.Text
			originalReplyAuthorEmail     pgtype.Text
			originalReplyAuthorDisplay   pgtype.Text
			originalReplyAuthorAvatarURL pgtype.Text
			originalReplyAuthorBannerURL pgtype.Text
			originalReplyAuthorVerified  pgtype.Bool
			originalReplyAuthorCreatedAt pgtype.Timestamptz
			originalReplyAuthorUpdatedAt pgtype.Timestamptz
			originalReplyAuthorFollowing *[]string
			originalReplyAuthorFollowers *[]string
		)

		err := rows.Scan(
			&tweet.ID,
			&tweet.UserID,
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
			&user.ID,
			&user.Username,
			&user.Email,
			&user.DisplayName,
			&user.AvatarURL,
			&user.BannerURL,
			&user.IsVerified,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.Following,
			&user.Followers,
			&replyID,
			&replyUserID,
			&replyContent,
			&replyInReplyToID,
			&replyOriginalTweetID,
			&replyMediaURLs,
			&replyRepliesCount,
			&replyLikesCount,
			&replyRetweetsCount,
			&replyViewsCount,
			&replyBookmarksCount,
			&replyCreatedAt,
			&replyUpdatedAt,
			&replyAuthorID,
			&replyAuthorUsername,
			&replyAuthorEmail,
			&replyAuthorDisplay,
			&replyAuthorAvatarURL,
			&replyAuthorBannerURL,
			&replyAuthorVerified,
			&replyAuthorCreatedAt,
			&replyAuthorUpdatedAt,
			&replyAuthorFollowing,
			&replyAuthorFollowers,
			&originalID,
			&originalUserID,
			&originalContent,
			&originalInReplyToID,
			&originalOriginalTweetID,
			&originalMediaURLs,
			&originalRepliesCount,
			&originalLikesCount,
			&originalRetweetsCount,
			&originalViewsCount,
			&originalBookmarksCount,
			&originalCreatedAt,
			&originalUpdatedAt,
			&originalAuthorID,
			&originalAuthorUsername,
			&originalAuthorEmail,
			&originalAuthorDisplay,
			&originalAuthorAvatarURL,
			&originalAuthorBannerURL,
			&originalAuthorVerified,
			&originalAuthorCreatedAt,
			&originalAuthorUpdatedAt,
			&originalAuthorFollowing,
			&originalAuthorFollowers,
			&originalReplyID,
			&originalReplyUserID,
			&originalReplyContent,
			&originalReplyInReplyToID,
			&originalReplyOriginalTweetID,
			&originalReplyMediaURLs,
			&originalReplyRepliesCount,
			&originalReplyLikesCount,
			&originalReplyRetweetsCount,
			&originalReplyViewsCount,
			&originalReplyBookmarksCount,
			&originalReplyCreatedAt,
			&originalReplyUpdatedAt,
			&originalReplyAuthorID,
			&originalReplyAuthorUsername,
			&originalReplyAuthorEmail,
			&originalReplyAuthorDisplay,
			&originalReplyAuthorAvatarURL,
			&originalReplyAuthorBannerURL,
			&originalReplyAuthorVerified,
			&originalReplyAuthorCreatedAt,
			&originalReplyAuthorUpdatedAt,
			&originalReplyAuthorFollowing,
			&originalReplyAuthorFollowers,
			&tweet.IsLiked,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tweet: %w", err)
		}

		tweet.User = user

		if replyID.Valid {
			replyAuthor := models.User{
				ID:          uuid.UUID(replyAuthorID.Bytes),
				Username:    replyAuthorUsername.String,
				Email:       replyAuthorEmail.String,
				DisplayName: utils.StringPtrFromPgType(replyAuthorDisplay),
				AvatarURL:   utils.StringPtrFromPgType(replyAuthorAvatarURL),
				BannerURL:   utils.StringPtrFromPgType(replyAuthorBannerURL),
				IsVerified:  replyAuthorVerified.Bool,
				CreatedAt:   replyAuthorCreatedAt.Time,
				UpdatedAt:   replyAuthorUpdatedAt.Time,
				Following:   *replyAuthorFollowing,
				Followers:   *replyAuthorFollowers,
			}

			replyTweet := models.Tweet{
				ID:               uuid.UUID(replyID.Bytes),
				UserID:           uuid.UUID(replyUserID.Bytes),
				Content:          utils.StringPtrFromPgType(replyContent),
				InReplyToTweetID: utils.UUIDFromPgType(replyInReplyToID),
				OriginalTweetID:  utils.UUIDFromPgType(replyOriginalTweetID),
				MediaURLs:        replyMediaURLs,
				RepliesCount:     int(replyRepliesCount.Int32),
				LikesCount:       int(replyLikesCount.Int32),
				RetweetsCount:    int(replyRetweetsCount.Int32),
				ViewsCount:       int(replyViewsCount.Int32),
				BookmarksCount:   int(replyBookmarksCount.Int32),
				CreatedAt:        replyCreatedAt.Time,
				UpdatedAt:        replyUpdatedAt.Time,
				User:             replyAuthor,
			}

			tweet.ReplyTo = &replyTweet
		}

		if originalID.Valid {
			originalAuthor := models.User{
				ID:          uuid.UUID(originalAuthorID.Bytes),
				Username:    originalAuthorUsername.String,
				Email:       originalAuthorEmail.String,
				DisplayName: utils.StringPtrFromPgType(originalAuthorDisplay),
				AvatarURL:   utils.StringPtrFromPgType(originalAuthorAvatarURL),
				BannerURL:   utils.StringPtrFromPgType(originalAuthorBannerURL),
				IsVerified:  originalAuthorVerified.Bool,
				CreatedAt:   originalAuthorCreatedAt.Time,
				UpdatedAt:   originalAuthorUpdatedAt.Time,
				Following:   *originalAuthorFollowing,
				Followers:   *originalAuthorFollowers,
			}

			originalTweet := models.Tweet{
				ID:               uuid.UUID(originalID.Bytes),
				UserID:           uuid.UUID(originalUserID.Bytes),
				Content:          utils.StringPtrFromPgType(originalContent),
				InReplyToTweetID: utils.UUIDFromPgType(originalInReplyToID),
				OriginalTweetID:  utils.UUIDFromPgType(originalOriginalTweetID),
				MediaURLs:        originalMediaURLs,
				RepliesCount:     int(originalRepliesCount.Int32),
				LikesCount:       int(originalLikesCount.Int32),
				RetweetsCount:    int(originalRetweetsCount.Int32),
				ViewsCount:       int(originalViewsCount.Int32),
				BookmarksCount:   int(originalBookmarksCount.Int32),
				CreatedAt:        originalCreatedAt.Time,
				UpdatedAt:        originalUpdatedAt.Time,
				User:             originalAuthor,
			}

			if originalReplyID.Valid {
				originalReplyAuthor := models.User{
					ID:          uuid.UUID(originalReplyAuthorID.Bytes),
					Username:    originalReplyAuthorUsername.String,
					Email:       originalReplyAuthorEmail.String,
					DisplayName: utils.StringPtrFromPgType(originalReplyAuthorDisplay),
					AvatarURL:   utils.StringPtrFromPgType(originalReplyAuthorAvatarURL),
					BannerURL:   utils.StringPtrFromPgType(originalReplyAuthorBannerURL),
					IsVerified:  originalReplyAuthorVerified.Bool,
					CreatedAt:   originalReplyAuthorCreatedAt.Time,
					UpdatedAt:   originalReplyAuthorUpdatedAt.Time,
					Following:   *originalReplyAuthorFollowing,
					Followers:   *originalReplyAuthorFollowers,
				}

				originalReplyTweet := models.Tweet{
					ID:               uuid.UUID(originalReplyID.Bytes),
					UserID:           uuid.UUID(originalReplyUserID.Bytes),
					Content:          utils.StringPtrFromPgType(originalReplyContent),
					InReplyToTweetID: utils.UUIDFromPgType(originalReplyInReplyToID),
					OriginalTweetID:  utils.UUIDFromPgType(originalReplyOriginalTweetID),
					MediaURLs:        originalReplyMediaURLs,
					RepliesCount:     int(originalReplyRepliesCount.Int32),
					LikesCount:       int(originalReplyLikesCount.Int32),
					RetweetsCount:    int(originalReplyRetweetsCount.Int32),
					ViewsCount:       int(originalReplyViewsCount.Int32),
					BookmarksCount:   int(originalReplyBookmarksCount.Int32),
					CreatedAt:        originalReplyCreatedAt.Time,
					UpdatedAt:        originalReplyUpdatedAt.Time,
					User:             originalReplyAuthor,
				}

				originalTweet.ReplyTo = &originalReplyTweet
			}

			if tweet.Content != nil && *tweet.Content != "" {
				tweet.QuotedTweet = &originalTweet
			} else {
				tweet.RetweetedTweet = &originalTweet
			}
		}

		tweets = append(tweets, tweet)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}

func GetTweetByID(ctx context.Context, tweetID string, userID *string) (*models.Tweet, error) {
	query := `
	SELECT 
		-- Main tweet
		t.id, t.user_id, t.content, t.in_reply_to_tweet_id, t.original_tweet_id, t.media_urls,
		t.replies_count, t.likes_count, t.retweets_count, t.views_count, t.bookmarks_count,
		t.created_at, t.updated_at,
		u.id, u.username, u.email, u.display_name, u.avatar_url, u.banner_url, u.is_verified, 
		u.created_at, u.updated_at,
		ARRAY(
			SELECT u2.username
			FROM follows f
			JOIN users u2 ON u2.id = f.following_id
			WHERE f.follower_id = u.id
		) as following,
		ARRAY(
			SELECT u2.username
			FROM follows f
			JOIN users u2 ON u2.id = f.follower_id
			WHERE f.following_id = u.id
		) as followers,

		-- Reply tweet
		rt.id, rt.user_id, rt.content, rt.in_reply_to_tweet_id, rt.original_tweet_id, rt.media_urls,
		rt.replies_count, rt.likes_count, rt.retweets_count, rt.views_count, rt.bookmarks_count,
		rt.created_at, rt.updated_at,
		ru.id, ru.username, ru.email, ru.display_name, ru.avatar_url, ru.banner_url, ru.is_verified, 
		ru.created_at, ru.updated_at,
		ARRAY(
			SELECT u3.username
			FROM follows f
			JOIN users u3 ON u3.id = f.following_id
			WHERE f.follower_id = ru.id
		) as reply_following,
		ARRAY(
			SELECT u3.username
			FROM follows f
			JOIN users u3 ON u3.id = f.follower_id
			WHERE f.following_id = ru.id
		) as reply_followers,

		-- Replies as JSON
		(
			SELECT COALESCE(json_agg(json_build_object(
				'id', t2.id,
				'user_id', u2.id,
				'content', t2.content,
				'in_reply_to_tweet_id', t2.in_reply_to_tweet_id,
				'original_tweet_id', t2.original_tweet_id,
				'media_urls', t2.media_urls,
				'replies_count', t2.replies_count,
				'likes_count', t2.likes_count,
				'retweets_count', t2.retweets_count,
				'views_count', t2.views_count,
				'bookmarks_count', t2.bookmarks_count,
				'created_at', t2.created_at,
				'updated_at', t2.updated_at,
				'user', json_build_object(
					'id', u2.id,
					'username', u2.username,
					'email', u2.email,
					'display_name', u2.display_name,
					'avatar_url', u2.avatar_url,
					'banner_url', u2.banner_url,
					'is_verified', u2.is_verified,
					'created_at', u2.created_at,
					'updated_at', u2.updated_at,
					'following', ARRAY(
						SELECT f1u.username
						FROM follows f1
						JOIN users f1u ON f1u.id = f1.following_id
						WHERE f1.follower_id = u2.id
					),
					'followers', ARRAY(
						SELECT f2u.username
						FROM follows f2
						JOIN users f2u ON f2u.id = f2.follower_id
						WHERE f2.following_id = u2.id
					)
				)
			)), '[]'::json)
			FROM tweets t2
			JOIN users u2 ON u2.id = t2.user_id
			WHERE t2.in_reply_to_tweet_id = t.id
		) AS replies,

		-- Original tweet
		ot.id, ot.user_id, ot.content, ot.in_reply_to_tweet_id, ot.original_tweet_id, ot.media_urls,
		ot.replies_count, ot.likes_count, ot.retweets_count, ot.views_count, ot.bookmarks_count,
		ot.created_at, ot.updated_at,
		ou.id, ou.username, ou.email, ou.display_name, ou.avatar_url, ou.banner_url, ou.is_verified, 
		ou.created_at, ou.updated_at,
		ARRAY(
			SELECT u4.username
			FROM follows f
			JOIN users u4 ON u4.id = f.following_id
			WHERE f.follower_id = ou.id
		) as original_following,
		ARRAY(
			SELECT u4.username
			FROM follows f
			JOIN users u4 ON u4.id = f.follower_id
			WHERE f.following_id = ou.id
		) as original_followers,

		-- Reply-to of original tweet
		ort.id, ort.user_id, ort.content, ort.in_reply_to_tweet_id, ort.original_tweet_id, ort.media_urls,
		ort.replies_count, ort.likes_count, ort.retweets_count, ort.views_count, ort.bookmarks_count,
		ort.created_at, ort.updated_at,
		oru.id, oru.username, oru.email, oru.display_name, oru.avatar_url, oru.banner_url, oru.is_verified,
		oru.created_at, oru.updated_at,
		ARRAY(
			SELECT u5.username
			FROM follows f
			JOIN users u5 ON u5.id = f.following_id
			WHERE f.follower_id = oru.id
		) as original_reply_following,
		ARRAY(
			SELECT u5.username
			FROM follows f
			JOIN users u5 ON u5.id = f.follower_id
			WHERE f.following_id = oru.id
		) as original_reply_followers,

		EXISTS (
			SELECT 1
			FROM likes l
			WHERE l.tweet_id = t.id AND l.user_id = $2
		) as is_liked

	FROM tweets t
	JOIN users u ON u.id = t.user_id
	LEFT JOIN tweets rt ON rt.id = t.in_reply_to_tweet_id
	LEFT JOIN users ru ON ru.id = rt.user_id
	LEFT JOIN tweets ot ON ot.id = t.original_tweet_id
	LEFT JOIN users ou ON ou.id = ot.user_id
	LEFT JOIN tweets ort ON ort.id = ot.in_reply_to_tweet_id
	LEFT JOIN users oru ON oru.id = ort.user_id
	WHERE t.id = $1
	LIMIT 1
	`

	var tweet models.Tweet
	var user models.User
	var repliesJSON []byte

	var (
		replyID              pgtype.UUID
		replyUserID          pgtype.UUID
		replyContent         pgtype.Text
		replyInReplyToID     pgtype.UUID
		replyOriginalTweetID pgtype.UUID
		replyMediaURLs       *[]string
		replyRepliesCount    pgtype.Int4
		replyLikesCount      pgtype.Int4
		replyRetweetsCount   pgtype.Int4
		replyViewsCount      pgtype.Int4
		replyBookmarksCount  pgtype.Int4
		replyCreatedAt       pgtype.Timestamptz
		replyUpdatedAt       pgtype.Timestamptz
		replyAuthorID        pgtype.UUID
		replyAuthorUsername  pgtype.Text
		replyAuthorEmail     pgtype.Text
		replyAuthorDisplay   pgtype.Text
		replyAuthorAvatarURL pgtype.Text
		replyAuthorBannerURL pgtype.Text
		replyAuthorVerified  pgtype.Bool
		replyAuthorCreatedAt pgtype.Timestamptz
		replyAuthorUpdatedAt pgtype.Timestamptz
		replyAuthorFollowing *[]string
		replyAuthorFollowers *[]string
	)

	var (
		originalID              pgtype.UUID
		originalUserID          pgtype.UUID
		originalContent         pgtype.Text
		originalInReplyToID     pgtype.UUID
		originalOriginalTweetID pgtype.UUID
		originalMediaURLs       *[]string
		originalRepliesCount    pgtype.Int4
		originalLikesCount      pgtype.Int4
		originalRetweetsCount   pgtype.Int4
		originalViewsCount      pgtype.Int4
		originalBookmarksCount  pgtype.Int4
		originalCreatedAt       pgtype.Timestamptz
		originalUpdatedAt       pgtype.Timestamptz
		originalAuthorID        pgtype.UUID
		originalAuthorUsername  pgtype.Text
		originalAuthorEmail     pgtype.Text
		originalAuthorDisplay   pgtype.Text
		originalAuthorAvatarURL pgtype.Text
		originalAuthorBannerURL pgtype.Text
		originalAuthorVerified  pgtype.Bool
		originalAuthorCreatedAt pgtype.Timestamptz
		originalAuthorUpdatedAt pgtype.Timestamptz
		originalAuthorFollowing *[]string
		originalAuthorFollowers *[]string
	)

	var (
		originalReplyID              pgtype.UUID
		originalReplyUserID          pgtype.UUID
		originalReplyContent         pgtype.Text
		originalReplyInReplyToID     pgtype.UUID
		originalReplyOriginalTweetID pgtype.UUID
		originalReplyMediaURLs       *[]string
		originalReplyRepliesCount    pgtype.Int4
		originalReplyLikesCount      pgtype.Int4
		originalReplyRetweetsCount   pgtype.Int4
		originalReplyViewsCount      pgtype.Int4
		originalReplyBookmarksCount  pgtype.Int4
		originalReplyCreatedAt       pgtype.Timestamptz
		originalReplyUpdatedAt       pgtype.Timestamptz
		originalReplyAuthorID        pgtype.UUID
		originalReplyAuthorUsername  pgtype.Text
		originalReplyAuthorEmail     pgtype.Text
		originalReplyAuthorDisplay   pgtype.Text
		originalReplyAuthorAvatarURL pgtype.Text
		originalReplyAuthorBannerURL pgtype.Text
		originalReplyAuthorVerified  pgtype.Bool
		originalReplyAuthorCreatedAt pgtype.Timestamptz
		originalReplyAuthorUpdatedAt pgtype.Timestamptz
		originalReplyAuthorFollowing *[]string
		originalReplyAuthorFollowers *[]string
	)

	err := db.Pool.QueryRow(ctx, query, tweetID, userID).Scan(
		&tweet.ID,
		&tweet.UserID,
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
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.AvatarURL,
		&user.BannerURL,
		&user.IsVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Following,
		&user.Followers,
		&replyID,
		&replyUserID,
		&replyContent,
		&replyInReplyToID,
		&replyOriginalTweetID,
		&replyMediaURLs,
		&replyRepliesCount,
		&replyLikesCount,
		&replyRetweetsCount,
		&replyViewsCount,
		&replyBookmarksCount,
		&replyCreatedAt,
		&replyUpdatedAt,
		&replyAuthorID,
		&replyAuthorUsername,
		&replyAuthorEmail,
		&replyAuthorDisplay,
		&replyAuthorAvatarURL,
		&replyAuthorBannerURL,
		&replyAuthorVerified,
		&replyAuthorCreatedAt,
		&replyAuthorUpdatedAt,
		&replyAuthorFollowing,
		&replyAuthorFollowers,
		&repliesJSON,
		&originalID,
		&originalUserID,
		&originalContent,
		&originalInReplyToID,
		&originalOriginalTweetID,
		&originalMediaURLs,
		&originalRepliesCount,
		&originalLikesCount,
		&originalRetweetsCount,
		&originalViewsCount,
		&originalBookmarksCount,
		&originalCreatedAt,
		&originalUpdatedAt,
		&originalAuthorID,
		&originalAuthorUsername,
		&originalAuthorEmail,
		&originalAuthorDisplay,
		&originalAuthorAvatarURL,
		&originalAuthorBannerURL,
		&originalAuthorVerified,
		&originalAuthorCreatedAt,
		&originalAuthorUpdatedAt,
		&originalAuthorFollowing,
		&originalAuthorFollowers,
		&originalReplyID,
		&originalReplyUserID,
		&originalReplyContent,
		&originalReplyInReplyToID,
		&originalReplyOriginalTweetID,
		&originalReplyMediaURLs,
		&originalReplyRepliesCount,
		&originalReplyLikesCount,
		&originalReplyRetweetsCount,
		&originalReplyViewsCount,
		&originalReplyBookmarksCount,
		&originalReplyCreatedAt,
		&originalReplyUpdatedAt,
		&originalReplyAuthorID,
		&originalReplyAuthorUsername,
		&originalReplyAuthorEmail,
		&originalReplyAuthorDisplay,
		&originalReplyAuthorAvatarURL,
		&originalReplyAuthorBannerURL,
		&originalReplyAuthorVerified,
		&originalReplyAuthorCreatedAt,
		&originalReplyAuthorUpdatedAt,
		&originalReplyAuthorFollowing,
		&originalReplyAuthorFollowers,
		&tweet.IsLiked,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query tweet: %w", err)
	}

	thread, err := GetTweetThreadByID(ctx, tweetID, userID)
	if err != nil {
		log.Printf("Failed to fetch thread for tweet %s: %v", tweetID, err)
	} else {
		tweet.Thread = &thread
	}

	var replies []models.Tweet
	if err := json.Unmarshal(repliesJSON, &replies); err != nil {
		return nil, fmt.Errorf("failed to unmarshal replies JSON: %w", err)
	}
	tweet.Replies = &replies

	tweet.User = user

	if replyID.Valid {
		replyAuthor := models.User{
			ID:          uuid.UUID(replyAuthorID.Bytes),
			Username:    replyAuthorUsername.String,
			Email:       replyAuthorEmail.String,
			DisplayName: utils.StringPtrFromPgType(replyAuthorDisplay),
			AvatarURL:   utils.StringPtrFromPgType(replyAuthorAvatarURL),
			BannerURL:   utils.StringPtrFromPgType(replyAuthorBannerURL),
			IsVerified:  replyAuthorVerified.Bool,
			CreatedAt:   replyAuthorCreatedAt.Time,
			UpdatedAt:   replyAuthorUpdatedAt.Time,
			Following:   *replyAuthorFollowing,
			Followers:   *replyAuthorFollowers,
		}

		replyTweet := models.Tweet{
			ID:               uuid.UUID(replyID.Bytes),
			UserID:           uuid.UUID(replyUserID.Bytes),
			Content:          utils.StringPtrFromPgType(replyContent),
			InReplyToTweetID: utils.UUIDFromPgType(replyInReplyToID),
			OriginalTweetID:  utils.UUIDFromPgType(replyOriginalTweetID),
			MediaURLs:        replyMediaURLs,
			RepliesCount:     int(replyRepliesCount.Int32),
			LikesCount:       int(replyLikesCount.Int32),
			RetweetsCount:    int(replyRetweetsCount.Int32),
			ViewsCount:       int(replyViewsCount.Int32),
			BookmarksCount:   int(replyBookmarksCount.Int32),
			CreatedAt:        replyCreatedAt.Time,
			UpdatedAt:        replyUpdatedAt.Time,
			User:             replyAuthor,
		}

		tweet.ReplyTo = &replyTweet
	}

	if originalID.Valid {
		originalAuthor := models.User{
			ID:          uuid.UUID(originalAuthorID.Bytes),
			Username:    originalAuthorUsername.String,
			Email:       originalAuthorEmail.String,
			DisplayName: utils.StringPtrFromPgType(originalAuthorDisplay),
			AvatarURL:   utils.StringPtrFromPgType(originalAuthorAvatarURL),
			BannerURL:   utils.StringPtrFromPgType(originalAuthorBannerURL),
			IsVerified:  originalAuthorVerified.Bool,
			CreatedAt:   originalAuthorCreatedAt.Time,
			UpdatedAt:   originalAuthorUpdatedAt.Time,
			Following:   *originalAuthorFollowing,
			Followers:   *originalAuthorFollowers,
		}

		originalTweet := models.Tweet{
			ID:               uuid.UUID(originalID.Bytes),
			UserID:           uuid.UUID(originalUserID.Bytes),
			Content:          utils.StringPtrFromPgType(originalContent),
			InReplyToTweetID: utils.UUIDFromPgType(originalInReplyToID),
			OriginalTweetID:  utils.UUIDFromPgType(originalOriginalTweetID),
			MediaURLs:        originalMediaURLs,
			RepliesCount:     int(originalRepliesCount.Int32),
			LikesCount:       int(originalLikesCount.Int32),
			RetweetsCount:    int(originalRetweetsCount.Int32),
			ViewsCount:       int(originalViewsCount.Int32),
			BookmarksCount:   int(originalBookmarksCount.Int32),
			CreatedAt:        originalCreatedAt.Time,
			UpdatedAt:        originalUpdatedAt.Time,
			User:             originalAuthor,
		}

		if originalReplyID.Valid {
			originalReplyAuthor := models.User{
				ID:          uuid.UUID(originalReplyAuthorID.Bytes),
				Username:    originalReplyAuthorUsername.String,
				Email:       originalReplyAuthorEmail.String,
				DisplayName: utils.StringPtrFromPgType(originalReplyAuthorDisplay),
				AvatarURL:   utils.StringPtrFromPgType(originalReplyAuthorAvatarURL),
				BannerURL:   utils.StringPtrFromPgType(originalReplyAuthorBannerURL),
				IsVerified:  originalReplyAuthorVerified.Bool,
				CreatedAt:   originalReplyAuthorCreatedAt.Time,
				UpdatedAt:   originalReplyAuthorUpdatedAt.Time,
				Following:   *originalReplyAuthorFollowing,
				Followers:   *originalReplyAuthorFollowers,
			}

			originalReplyTweet := models.Tweet{
				ID:               uuid.UUID(originalReplyID.Bytes),
				UserID:           uuid.UUID(originalReplyUserID.Bytes),
				Content:          utils.StringPtrFromPgType(originalReplyContent),
				InReplyToTweetID: utils.UUIDFromPgType(originalReplyInReplyToID),
				OriginalTweetID:  utils.UUIDFromPgType(originalReplyOriginalTweetID),
				MediaURLs:        originalReplyMediaURLs,
				RepliesCount:     int(originalReplyRepliesCount.Int32),
				LikesCount:       int(originalReplyLikesCount.Int32),
				RetweetsCount:    int(originalReplyRetweetsCount.Int32),
				ViewsCount:       int(originalReplyViewsCount.Int32),
				BookmarksCount:   int(originalReplyBookmarksCount.Int32),
				CreatedAt:        originalReplyCreatedAt.Time,
				UpdatedAt:        originalReplyUpdatedAt.Time,
				User:             originalReplyAuthor,
			}

			originalTweet.ReplyTo = &originalReplyTweet
		}

		if tweet.Content != nil && *tweet.Content != "" {
			tweet.QuotedTweet = &originalTweet
		} else if originalID.Valid {
			tweet.RetweetedTweet = &originalTweet
		}
	}

	return &tweet, nil
}

func GetTweetThreadByID(ctx context.Context, tweetID string, userID *string) ([]models.Tweet, error) {
	query := `
	WITH RECURSIVE reply_chain AS (
	SELECT * FROM tweets WHERE id = $1
	UNION ALL
	SELECT t.* FROM tweets t
	JOIN reply_chain rc ON rc.in_reply_to_tweet_id = t.id
	)
	SELECT 
		t.id, t.user_id, t.content, t.in_reply_to_tweet_id, t.original_tweet_id, t.media_urls,
		t.replies_count, t.likes_count, t.retweets_count, t.views_count, t.bookmarks_count,
		t.created_at, t.updated_at,

		u.id, u.username, u.email, u.display_name, u.avatar_url, u.banner_url, u.is_verified,
		u.created_at, u.updated_at,

		ARRAY(
		SELECT u2.username
		FROM follows f
		JOIN users u2 ON u2.id = f.following_id
		WHERE f.follower_id = u.id
		) as following,

		ARRAY(
		SELECT u2.username
		FROM follows f
		JOIN users u2 ON u2.id = f.follower_id
		WHERE f.following_id = u.id
		) as followers,

		EXISTS (
			SELECT 1
			FROM likes l
			WHERE l.tweet_id = t.id AND l.user_id = $2
		) as is_liked


	FROM reply_chain t
	JOIN users u ON u.id = t.user_id
	ORDER BY t.created_at ASC
	`

	rows, err := db.Pool.Query(ctx, query, tweetID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tweets []models.Tweet
	for rows.Next() {
		var tweet models.Tweet
		var user models.User

		err := rows.Scan(
			&tweet.ID,
			&tweet.UserID,
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

			&user.ID,
			&user.Username,
			&user.Email,
			&user.DisplayName,
			&user.AvatarURL,
			&user.BannerURL,
			&user.IsVerified,
			&user.CreatedAt,
			&user.UpdatedAt,

			&user.Following,
			&user.Followers,

			&tweet.IsLiked,
		)
		if err != nil {
			return nil, err
		}
		tweet.User = user
		tweets = append(tweets, tweet)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tweets, nil
}
