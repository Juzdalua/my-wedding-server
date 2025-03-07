import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './utils/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UdpModule } from './udp/udp.module';
import ormConfig from './config/ormconfig';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionsFilter } from './exception/global-exception.filter';
import { TcpModule } from './tcp/tcp.module';
import { PacketHandlerModule } from './packet-handler/packet-handler.module';
import { SocketModule } from './socket/socket.module';
import { CsvModule } from './csv/csv.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(ormConfig),
    TypeOrmModule.forFeature([]),
    UdpModule,
    TcpModule,
    PacketHandlerModule,
    SocketModule,
    CsvModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });

  }
}
