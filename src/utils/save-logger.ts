import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

export const saveLogger = winston.createLogger({
  level: 'error',
  format: combine(timestamp(), logFormat),
  exitOnError: false,
  transports: [
    // new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // 14일간 보관
      level: 'error',
    }),
  ],
});
