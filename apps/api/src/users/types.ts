export type UserResponse = {
  id: number;
  email: string;
  name: string;
  level: string; // or your specific UserLevel type
};

export type AuthResponse = {
  user: UserResponse;
  token: string;
};