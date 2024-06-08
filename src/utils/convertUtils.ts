import { avatarType, IUser } from "../db/models/user";

export interface UserSummaryProps {
  birth: string;
  avatar: avatarType;
  comment: string;
  isActive?: boolean;
  location: string;
  name: string;
  profileImage: string;
  score: number;
  uid: string;
  monthScore: number;
}

export const convertUserToSummary = (user: IUser): UserSummaryProps => {
  const {
    birth,
    avatar,
    comment,
    isActive,
    location,
    name,
    profileImage,
    score,
    uid,
    monthScore,
  } = user;

  return {
    birth,
    avatar,
    comment,
    isActive,
    location,
    name,
    profileImage,
    score,
    uid,
    monthScore,
  };
};
