import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      // 응답 시간 부분에 색상 적용 (노란색으로)
      const formattedStatusCode = this.formatStatusCode(statusCode);
      const formattedResponseTime = this.formatResponseTime(responseTime);

      this.logger.log(`${method} ${originalUrl} ${formattedStatusCode} ${formattedResponseTime}`);
    });

    next();
  }

  /**
    블랙: \x1b[30m
    레드: \x1b[31m
    그린: \x1b[32m
    옐로우 (노랑): \x1b[33m
    블루: \x1b[34m
    마젠타: \x1b[35m
    시안: \x1b[36m
    화이트: \x1b[37m
   */

  private formatStatusCode(statusCode: number): string {
    return `\x1b[34m${statusCode}\x1b[0m`;
  }

  private formatResponseTime(responseTime: number): string {
    return `\x1b[33m+${responseTime}ms\x1b[0m`;
  }
}
