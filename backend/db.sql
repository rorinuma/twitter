CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tweets table
CREATE TABLE tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content TEXT,
  in_reply_to_tweet_id UUID,
  original_tweet_id UUID,
  media_urls TEXT[],
  replies_count INTEGER NOT NULL DEFAULT 0 CHECK (replies_count >= 0),
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  retweets_count INTEGER NOT NULL DEFAULT 0 CHECK (retweets_count >= 0),
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  bookmarks_count INTEGER NOT NULL DEFAULT 0 CHECK (bookmarks_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply FOREIGN KEY (in_reply_to_tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
  CONSTRAINT fk_original FOREIGN KEY (original_tweet_id) REFERENCES tweets(id) ON DELETE CASCADE
);

CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE likes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  user_id UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(tweet_id, user_id)
);

CREATE TABLE views (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  user_id UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(tweet_id, user_id)
);

-- Optional indexes for performance (especially for querying tweets)
CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_in_reply_to ON tweets(in_reply_to_tweet_id);
CREATE INDEX idx_tweets_original_id ON tweets(original_tweet_id);
CREATE INDEX idx_users_username ON users(username);

