package models


import ( 
	"time"
	"github.com/google/uuid"
)

type Tweet struct {
	ID uuid.UUID `json:"id"`
	UserId string `json:"userId"`
	Content *string `json:"content,omitempty"`
	InReplyToTweetID *uuid.UUID `json:"inReplyToTweetId,omitempty"`
	OriginalTweetID *uuid.UUID `json:"originalTweetId,omitempty"`
	MediaURLs *[]string `json:"mediaURLs,omitempty"`
	RepliesCount int `json:"repliesCount"`
	LikesCount int `json:"likesCount"`
	RetweetsCount int `json:"retweetsCount"`
	ViewsCount int `json:"viewsCount"`
	BookmarksCount int `json:"bookmarksCount"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateTweetInput struct {
	UserID string `json:"userId"`
	Content *string `json:"content"`
	InReplyToTweetID *uuid.UUID `json:"inReplyToTweetId,omitempty"`
	OriginalTweetID *uuid.UUID `json:"originalTweetId,omitempty"`
	MediaURLs *[]string `json:"mediaURLs"`
}
