import { PacketHandlerModule } from '@/packet-handler/packet-handler.module';
import { SocketModule } from '@/socket/socket.module';
import { UdpService } from '@/udp/udp.service';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TcpController } from './tcp.controller';
import { TcpService } from './tcp.service';

@Module({
  imports: [ConfigModule.forRoot(), forwardRef(() => SocketModule), forwardRef(() => PacketHandlerModule)],
  controllers: [TcpController],
  providers: [TcpService, UdpService],
  exports: [TcpService]
})
export class TcpModule {}
