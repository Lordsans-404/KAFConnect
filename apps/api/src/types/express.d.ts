// src/types/express.d.ts
import { UserPayload } from '../auth/user-payload.interface'; // sesuaikan path

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
