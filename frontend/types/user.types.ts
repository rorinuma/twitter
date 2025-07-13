export interface User {
  id: string; // UUID
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarURL?: string;
  bannerURL?: string;
  isVerified: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  following: string[];
  followers: string[];
}

export interface RawUser {
  id: string;
  username: string;
  email: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  following: string[];
  followers: string[];
}
