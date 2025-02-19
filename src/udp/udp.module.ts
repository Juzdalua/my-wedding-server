import { PacketHandlerModule } from '@/packet-handler/packet-handler.module';
import { forwardRef, Module } from '@nestjs/common';
import { UdpController } from './udp.controller';
import { UdpService } from './udp.service';

@Module({
  imports: [forwardRef(() => PacketHandlerModule)],
  controllers: [UdpController],
  providers: [UdpService],
  exports: [UdpService],
})
export class UdpModule {}
