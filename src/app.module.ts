import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './utils/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UdpModule } from './udp/udp.module';
import ormConfig from './config/ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(ormConfig),
    TypeOrmModule.forFeature([]),
    UdpModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/api/*path');
  }
}
