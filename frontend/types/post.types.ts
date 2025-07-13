export enum ReplyPermissionType {
  Everyone = "everyone",
  Followed = "followed",
  Verified = "verified",
  Mentioned = "mentioned",
}

export type ReplyPermission =
  | { type: ReplyPermissionType.Everyone }
  | { type: ReplyPermissionType.Followed }
  | { type: ReplyPermissionType.Verified }
  | { type: ReplyPermissionType.Mentioned; mentions: string[] };
