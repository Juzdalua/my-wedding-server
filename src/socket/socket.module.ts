import { TcpModule } from '@/tcp/tcp.module';
import { forwardRef, Module } from '@nestjs/common';
import { SocketService } from './socket.service';

@Module({
  imports: [forwardRef(() => TcpModule)],
  providers: [SocketService],
  exports: [SocketService]
})
export class SocketModule {}
