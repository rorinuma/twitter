package utils

import (
	"fmt"
	"strings"
)

const TweetFields = `
    t.id, t.user_id, t.content, t.in_reply_to_tweet_id, t.original_tweet_id, t.media_urls,
    t.replies_count, t.likes_count, t.retweets_count, t.views_count, t.bookmarks_count,
    t.created_at, t.updated_at`

const UserFields = `
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
    ) as followers`

const ReplyTweetFields = `
    rt.id, rt.user_id, rt.content, rt.in_reply_to_tweet_id, rt.original_tweet_id, rt.media_urls,
    rt.replies_count, rt.likes_count, rt.retweets_count, rt.views_count, rt.bookmarks_count,
    rt.created_at, rt.updated_at`

const ReplyUserFields = `
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
    ) as reply_followers`

const OriginalTweetFields = `
    ot.id, ot.user_id, ot.content, ot.in_reply_to_tweet_id, ot.original_tweet_id, ot.media_urls,
    ot.replies_count, ot.likes_count, ot.retweets_count, ot.views_count, ot.bookmarks_count,
    ot.created_at, ot.updated_at`

const OriginalUserFields = `
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
    ) as original_followers`

const OriginalReplyTweetFields = `
    ort.id, ort.user_id, ort.content, ort.in_reply_to_tweet_id, ort.original_tweet_id, ort.media_urls,
    ort.replies_count, ort.likes_count, ort.retweets_count, ort.views_count, ort.bookmarks_count,
    ort.created_at, ort.updated_at`

const OriginalReplyUserFields = `
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
    ) as original_reply_followers`

const StatusFields = `
    EXISTS (
        SELECT 1
        FROM likes l
        WHERE l.tweet_id = t.id AND l.user_id = $1
    ) as is_liked,
    EXISTS (
        SELECT 1
        FROM tweets t2
        WHERE t2.user_id = $1 AND t2.original_tweet_id = t.id
    ) as is_retweeted,
    EXISTS (
        SELECT 1
        FROM views v
        WHERE v.tweet_id = t.id AND v.user_id = $1
    ) as is_viewed,
    EXISTS (
        SELECT 1
        FROM bookmarks b
        WHERE b.tweet_id = t.id AND b.user_id = $1
    ) as is_bookmarked,
    EXISTS (
        SELECT 1
        FROM likes l
        WHERE l.tweet_id = ot.id AND l.user_id = $1
    ) as original_is_liked,
    EXISTS (
        SELECT 1
        FROM views v
        WHERE v.tweet_id = ot.id AND v.user_id = $1
    ) as original_is_viewed,
    EXISTS (
        SELECT 1
        FROM bookmarks b
        WHERE b.tweet_id = ot.id AND b.user_id = $1
    ) as original_is_bookmarked`

const ReplyJSONFields = `
    COALESCE((
        SELECT json_agg(json_build_object(
            'id', t2.id,
            'user_id', t2.user_id,
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
            'is_liked', EXISTS (
                SELECT 1
                FROM likes l
                WHERE l.tweet_id = t2.id AND l.user_id = $1
            ),
            'is_retweeted', EXISTS (
                SELECT 1
                FROM tweets t3
                WHERE t3.user_id = $1 AND t3.original_tweet_id = t2.id
            ),
            'is_viewed', EXISTS (
                SELECT 1
                FROM views v
                WHERE v.tweet_id = t2.id AND v.user_id = $1
            ),
            'is_bookmarked', EXISTS (
                SELECT 1
                FROM bookmarks b
                WHERE b.tweet_id = t2.id AND b.user_id = $1
            ),
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
                    SELECT u3.username
                    FROM follows f
                    JOIN users u3 ON u3.id = f.following_id
                    WHERE f.follower_id = u2.id
                ),
								'followers', ARRAY(
								    SELECT u4.username
								    FROM follows f
								    JOIN users u4 ON u4.id = f.follower_id
								    WHERE f.following_id = u2.id
								)
            )
        ))
        FROM tweets t2
        JOIN users u2 ON u2.id = t2.user_id
				WHERE t2.in_reply_to_tweet_id = t.id
    ), '[]'::json) AS replies`

const ThreadQuery = `
    WITH RECURSIVE reply_chain AS (
        SELECT %s
        FROM tweets t
        WHERE t.id = $1
        UNION ALL
        SELECT %s
        FROM tweets t
        JOIN reply_chain rc ON rc.in_reply_to_tweet_id = t.id
    )
    SELECT
        %s,
        %s,
        %s
    FROM reply_chain t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at ASC
`

const BaseJoins = `
    FROM tweets t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN tweets rt ON rt.id = t.in_reply_to_tweet_id
    LEFT JOIN users ru ON ru.id = rt.user_id
    LEFT JOIN tweets ot ON ot.id = t.original_tweet_id
    LEFT JOIN users ou ON ou.id = ot.user_id
    LEFT JOIN tweets ort ON ort.id = ot.in_reply_to_tweet_id
    LEFT JOIN users oru ON oru.id = ort.user_id`


func BuildTweetQuery(whereClause string, includeRepliesJSON bool) string {
    fields := []string{
        TweetFields,
        UserFields,
        ReplyTweetFields,
        ReplyUserFields,
        OriginalTweetFields,
        OriginalUserFields,
        OriginalReplyTweetFields,
        OriginalReplyUserFields,
        StatusFields,
    }
    if includeRepliesJSON {
        fields = append(fields[:4], append([]string{ReplyJSONFields}, fields[4:]...)...)
    }

    return fmt.Sprintf(`
        SELECT %s
        %s
        %s
    `, strings.Join(fields, ","), BaseJoins, whereClause)
}

func BuildThreadQuery() string {
	fields := []string{
		TweetFields,
		UserFields,
		ReplyTweetFields,
		ReplyUserFields,
		OriginalTweetFields,
		OriginalUserFields,
		OriginalReplyTweetFields,
		OriginalReplyUserFields,
		StatusFields,
	}

	recursiveSelect := TweetFields
	recursivePart := fmt.Sprintf(`
		WITH RECURSIVE reply_chain AS (
			SELECT %s
			FROM tweets t
			WHERE t.id = $2
			UNION ALL
			SELECT %s
			FROM tweets t
			JOIN reply_chain rc ON rc.in_reply_to_tweet_id = t.id
		)`, recursiveSelect, recursiveSelect)

	return fmt.Sprintf(`
		%s
		SELECT %s
		%s
		WHERE t.id IN (SELECT id FROM reply_chain)
		ORDER BY t.created_at ASC
	`,
		recursivePart,
		strings.Join(fields, ","),
		BaseJoins,
	)
}

