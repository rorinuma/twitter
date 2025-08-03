package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type Tweet struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"user_id"`
	Content          *string    `json:"content,omitempty"`
	InReplyToTweetID *uuid.UUID `json:"in_reply_to_tweet_id,omitempty"`
	OriginalTweetID  *uuid.UUID `json:"original_tweet_id,omitempty"`
	MediaURLs        *[]string  `json:"media_urls,omitempty"`
	RepliesCount     int        `json:"replies_count"`
	LikesCount       int        `json:"likes_count"`
	RetweetsCount    int        `json:"retweets_count"`
	ViewsCount       int        `json:"views_count"`
	BookmarksCount   int        `json:"bookmarks_count"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	IsLiked          bool       `json:"is_liked"`
	IsRetweeted      bool       `json:"is_retweeted"`
	IsViewed         bool       `json:"is_viewed"`
	IsBookmarked     bool       `json:"is_bookmarked"`
	User             User       `json:"user"`
	ReplyTo          *Tweet     `json:"reply_to,omitempty"`
	Replies          *[]Tweet   `json:"replies,omitempty"`
	Thread           *[]Tweet   `json:"thread,omitempty"`
	RetweetedTweet   *Tweet     `json:"retweeted_tweet,omitempty"`
	QuotedTweet      *Tweet     `json:"quoted_tweet,omitempty"`
}

type TweetRow struct {
	ID               pgtype.UUID
	UserID           pgtype.UUID
	Content          pgtype.Text
	InReplyToTweetID pgtype.UUID
	OriginalTweetID  pgtype.UUID
	MediaURLs        *[]string
	RepliesCount     pgtype.Int4
	LikesCount       pgtype.Int4
	RetweetsCount    pgtype.Int4
	ViewsCount       pgtype.Int4
	BookmarksCount   pgtype.Int4
	CreatedAt        pgtype.Timestamptz
	UpdatedAt        pgtype.Timestamptz
	IsLiked          pgtype.Bool
	IsRetweeted      pgtype.Bool
	IsViewed         pgtype.Bool
	IsBookmarked     pgtype.Bool
}

func (t *TweetRow) ToTweet(user User, replyTo, quotedTweet, retweetedTweet *Tweet) Tweet {
	return Tweet{
		ID:               uuid.UUID(t.ID.Bytes),
		UserID:           uuid.UUID(t.UserID.Bytes),
		Content:          StringPtrFromPgType(t.Content),
		InReplyToTweetID: UUIDFromPgType(t.InReplyToTweetID),
		OriginalTweetID:  UUIDFromPgType(t.OriginalTweetID),
		MediaURLs:        t.MediaURLs,
		RepliesCount:     int(t.RepliesCount.Int32),
		LikesCount:       int(t.LikesCount.Int32),
		RetweetsCount:    int(t.RetweetsCount.Int32),
		ViewsCount:       int(t.ViewsCount.Int32),
		BookmarksCount:   int(t.BookmarksCount.Int32),
		CreatedAt:        t.CreatedAt.Time,
		UpdatedAt:        t.UpdatedAt.Time,
		IsLiked:          t.IsLiked.Bool,
		IsRetweeted:      t.IsRetweeted.Bool,
		IsViewed:         t.IsViewed.Bool,
		IsBookmarked:     t.IsBookmarked.Bool,
		User:             user,
		ReplyTo:          replyTo,
		QuotedTweet:      quotedTweet,
		RetweetedTweet:   retweetedTweet,
	}
}

type CreateTweetInput struct {
	UserID           uuid.UUID  `json:"userId"`
	Content          *string    `json:"content,omitempty"`
	ReplyPermission  string     `json:"replyPermission"`
	InReplyToTweetID *uuid.UUID `json:"inReplyToTweetId,omitempty"`
	OriginalTweetID  *uuid.UUID `json:"originalTweetId,omitempty"`
	MentionedUsers   *[]string  `json:"mentionedUsers,omitempty"`
	MediaURLs        *[]string  `json:"mediaURLs,omitempty"`
}

type StatusResponse struct {
	Tweet   *Tweet `json:"tweet"`
	Message string `json:"message"`
}

type TweetDeletedResponse struct {
	Message string
}
