package models

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)


func UUIDFromPgType(pgUUID pgtype.UUID) *uuid.UUID {
	if !pgUUID.Valid {
		return nil
	}

	id := uuid.UUID(pgUUID.Bytes)
	return &id
}

func StringPtrFromPgType(pgText pgtype.Text) *string {
	if !pgText.Valid {
		return nil
	}
	return &pgText.String
}
