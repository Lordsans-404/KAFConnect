import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request);
    
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,   // Now available
        level: payload.level,  // Now available
        isVerified: payload.isVerified  // Now available
      };
      
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private getToken(request: any): string {
    const auth = request.headers.authorization;
    return auth?.split(' ')[1]; // Get Bearer token
  }
}