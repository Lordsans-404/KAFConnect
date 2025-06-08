// src/auth/user-payload.interface.ts
export interface UserPayload {
  id: number;
  email: string;
  name?: string;
  level?: string;
  isVerified?: boolean;
}

