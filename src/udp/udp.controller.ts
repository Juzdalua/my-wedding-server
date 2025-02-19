import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { UdpService } from './udp.service';

@Controller('/udp')
export class UdpController implements OnModuleInit {
  constructor(private readonly udpService: UdpService) {}

  onModuleInit() {
    // try {
    //   this.udpService.listenForMessages();
    //   console.log(`✅ Success OnModuleInit UDP Server to Listen`);
    // } catch (error) {
    //   console.log(`❌ Listen UDP Server Error: ${error}`);
    // }
  }
}
