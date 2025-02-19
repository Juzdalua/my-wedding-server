import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { webcrypto } from 'node:crypto';
import * as path from 'path';
import { AppModule } from './app.module';
import { SocketService } from './socket/socket.service';
import { TcpService } from './tcp/tcp.service';
import { UdpService } from './udp/udp.service';

Object.defineProperty(globalThis, 'crypto', {
  get: () => webcrypto,
  configurable: false
});

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  // Use Public folder
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // Global Prefix
  app.setGlobalPrefix('api');

  // Exception
  // app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Global class-validator pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

  // Socket.IO 초기화
  const httpServer = app.getHttpServer();
  const socketService = app.get(SocketService);
  try {
    socketService.initializeSocket(httpServer);
    console.log('✅ Socket.IO initialized successfully 🚀');
  } catch (err) {
    console.error('Error initializing Socket.IO:', err);
  }

  // Start udp server
  try {
    const udpService = app.get(UdpService);
    // udpService.startServer('127.0.0.1', 1997);
    // udpService.startServer('192.168.10.123', 1997);
    // udpService.startServer('192.168.10.101', 1997);
  } catch (error) {
    console.log(`❌ Connect UDP Error: ${error}`);
  }

  // Start udp Client
  // try {
  //   this.udpService.listenForMessages();
  //   console.log(`✅ Success OnModuleInit UDP Server to Listen`);
  // } catch (error) {
  //   console.log(`❌ Listen UDP Server Error: ${error}`);
  // }

  // Start tcp Server
  try {
    const tcpService = app.get(TcpService);
    tcpService.startServer(process.env.TCP_SERVER_HOST, Number(process.env.TCP_SERVER_PORT));
  } catch (error) {
    console.log(`❌ Connect TCP listening on Server ${process.env.TCP_SERVER_HOST}:${Number(process.env.TCP_SERVER_PORT)} Error: ${error}`);
  }

  await app.listen(process.env.PORT ?? 8000);
  console.log(`✅ Application is running on: http://localhost:${process.env.PORT ?? 8000} 🚀`);
}
bootstrap();
