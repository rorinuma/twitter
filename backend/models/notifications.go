package models

import (
	"time"

	"github.com/google/uuid"
)

type NotificationType string

const (
	NotificationLike NotificationType = "like"
	NotificationReply   NotificationType = "reply"
	NotificationRetweet NotificationType = "retweet"
	NotificationQuote  NotificationType = "quote"
	NotificationFollow  NotificationType = "follow"
)

type Notification struct {
	ID        uuid.UUID         `json:"id"`
	Type      NotificationType  `json:"type"`
	IsRead    bool              `json:"is_read"`
	CreatedAt time.Time         `json:"created_at"`
	Actor     User              `json:"actor"`
	Tweet     *Tweet            `json:"tweet,omitempty"`
}

type CreateNotificationInput struct {
	UserID   *uuid.UUID 			 `json:"userID"`
	ActorID  *uuid.UUID        `json:"actorID"`
	Type     NotificationType  `json:"type"`
	TweetID  *uuid.UUID 			 `json:"tweetID,omitempty"`
}

