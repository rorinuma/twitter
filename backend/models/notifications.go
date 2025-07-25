package models

import "time"

type Notification struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
	Actor     User      `json:"actor"`
	Tweet     *Tweet    `json:"tweet,omitempty"`
}
