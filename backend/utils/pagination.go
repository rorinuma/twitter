package utils

import (
	"net/http"
	"strconv"
)

func GetPaginationParams(r *http.Request) (page, limit, offset int) {
	query := r.URL.Query()
	page, limit = 1, 10

	if p, err := strconv.Atoi(query.Get("page")); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(query.Get("limit")); err == nil && l > 0 {
		limit = l
	}
	offset = (page - 1) * limit
	return
}
