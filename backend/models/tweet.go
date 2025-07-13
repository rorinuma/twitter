package models

import (
	"time"

	"github.com/google/uuid"
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
	User             User       `json:"user"`
	ReplyTo          *Tweet     `json:"reply_to,omitempty"`
	Replies          *[]Tweet  	`json:"replies,omitempty"`					 
	Thread 					 *[]Tweet   `json:"thread,omitempty"` 
	RetweetedTweet   *Tweet     `json:"retweeted_tweet,omitempty"`
	QuotedTweet      *Tweet     `json:"quoted_tweet,omitempty"`
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

