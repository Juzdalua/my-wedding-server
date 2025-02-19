import { UdpModule } from '@/udp/udp.module';
import { forwardRef, Module } from '@nestjs/common';
import { PacketHandlerService } from './packet-handler.service';
import { SocketService } from '@/socket/socket.service';
import { TcpModule } from '@/tcp/tcp.module';

@Module({
  imports: [forwardRef(() => UdpModule), forwardRef(() => TcpModule)],
  providers: [PacketHandlerService, SocketService],
  exports: [PacketHandlerService],
})
export class PacketHandlerModule {}
