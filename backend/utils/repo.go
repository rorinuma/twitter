package utils

import (
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/rorinuma/twitter/models"
)

func ScanTweetRow(rows pgx.Rows) ([]models.Tweet, error) {
	var tweets []models.Tweet
	for rows.Next() {
		var t, rt, ot, ort models.TweetRow
		var u, ru, ou, oru models.UserRow

		err := rows.Scan(
			// Main tweet
			&t.ID, &t.UserID, &t.Content, &t.InReplyToTweetID, &t.OriginalTweetID, &t.MediaURLs,
			&t.RepliesCount, &t.LikesCount, &t.RetweetsCount, &t.ViewsCount, &t.BookmarksCount,
			&t.CreatedAt, &t.UpdatedAt,
			// Main user
			&u.ID, &u.Username, &u.Email, &u.DisplayName, &u.AvatarURL, &u.BannerURL, &u.IsVerified,
			&u.CreatedAt, &u.UpdatedAt, &u.Following, &u.Followers,
			// Reply tweet
			&rt.ID, &rt.UserID, &rt.Content, &rt.InReplyToTweetID, &rt.OriginalTweetID, &rt.MediaURLs,
			&rt.RepliesCount, &rt.LikesCount, &rt.RetweetsCount, &rt.ViewsCount, &rt.BookmarksCount,
			&rt.CreatedAt, &rt.UpdatedAt,
			// Reply user
			&ru.ID, &ru.Username, &ru.Email, &ru.DisplayName, &ru.AvatarURL, &ru.BannerURL, &ru.IsVerified,
			&ru.CreatedAt, &ru.UpdatedAt, &ru.Following, &ru.Followers,
			// Original tweet
			&ot.ID, &ot.UserID, &ot.Content, &ot.InReplyToTweetID, &ot.OriginalTweetID, &ot.MediaURLs,
			&ot.RepliesCount, &ot.LikesCount, &ot.RetweetsCount, &ot.ViewsCount, &ot.BookmarksCount,
			&ot.CreatedAt, &ot.UpdatedAt,
			// Original user
			&ou.ID, &ou.Username, &ou.Email, &ou.DisplayName, &ou.AvatarURL, &ou.BannerURL, &ou.IsVerified,
			&ou.CreatedAt, &ou.UpdatedAt, &ou.Following, &ou.Followers,
			// Original reply tweet
			&ort.ID, &ort.UserID, &ort.Content, &ort.InReplyToTweetID, &ort.OriginalTweetID, &ort.MediaURLs,
			&ort.RepliesCount, &ort.LikesCount, &ort.RetweetsCount, &ort.ViewsCount, &ort.BookmarksCount,
			&ort.CreatedAt, &ort.UpdatedAt,
			// Original reply user
			&oru.ID, &oru.Username, &oru.Email, &oru.DisplayName, &oru.AvatarURL, &oru.BannerURL, &oru.IsVerified,
			&oru.CreatedAt, &oru.UpdatedAt, &oru.Following, &oru.Followers,
			// Status fields
			&t.IsLiked, &t.IsRetweeted, &t.IsViewed, &t.IsBookmarked, &ot.IsLiked, &ot.IsViewed, &ot.IsBookmarked,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan tweet: %w", err)
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
		tweets = append(tweets, tweet)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return tweets, nil
}
