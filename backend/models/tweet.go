package models

import "time"

type Tweet struct {
	ID string `json:"id"`
	UserId string `json:"userId"`
	Content *string `json:"content,omitempty"`
	InReplyToTweetID *string `json:"inReplyToTweetId,omitempty"`
	OriginalTweetID *string `json:"originalTweetId,omitempty"`
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
	InReplyToTweetID *string `json:"inReplyToTweetId,omitempty"`
	OriginalTweetID *string `json:"originalTweetId,omitempty"`
	MediaURLs *[]string `json:"mediaURLs"`
}
