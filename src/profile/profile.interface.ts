export interface ProfileData {
  username: string;
  bio: string;
  image?: string;
}

export interface ProfileRO {
  profile: ProfileData;
}
