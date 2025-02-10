import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JWTRequest extends Request {
  mem_idx: number;
}

@Injectable()
export class JWTInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
        mem_idx: number;
      };
      request.mem_idx = decoded.mem_idx;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return next.handle();
  }
}
