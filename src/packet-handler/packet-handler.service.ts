import { SocketService } from '@/socket/socket.service';
import { TcpService } from '@/tcp/tcp.service';
import { UdpService } from '@/udp/udp.service';
import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IHandlePacket, PacketId } from './interface/packet-id.interface';
import { HandleProtocolType, SendClientType, VelocityStateDto } from './interface/packet-types';

@Injectable()
export class PacketHandlerService implements OnModuleInit {
  private handler: Map<number, (data: any) => Promise<object>>;
  private readonly logger = new Logger(PacketHandlerService.name);

  constructor(
    @Inject(forwardRef(() => UdpService))
    private readonly udpService: UdpService,

    @Inject(forwardRef(() => TcpService))
    private readonly tcpService: TcpService,

    private readonly socketService: SocketService
  ) {
    this.handler = new Map();
  }

  onModuleInit() {
    this.registerHandler();
  }

  private registerHandler() {
    this.handler.set(123, this.handleTestUDP.bind(this));
    this.handler.set(4000, this.handleTestTCP.bind(this));

    ///////////////////////////////////////////////
    // UDP
    ///////////////////////////////////////////////
    this.handler.set(PacketId.RECV_VEHICLE_STATUS, this.handleRecvVehicleStatus.bind(this));

    this.handler.set(PacketId.RECV_START_AUTO_DRIVE, this.handleRecvStartAutoDrive.bind(this));

    this.handler.set(PacketId.RECV_DONE_AUTO_DRIVE, this.handleRecvDoneAutoDrive.bind(this));

    this.handler.set(PacketId.RECV_STARTING_STATUS, this.handleRecvStartingStatus.bind(this));

    ///////////////////////////////////////////////
    // TCP
    ///////////////////////////////////////////////
  }

  async handlePacket(handleProtocolType: HandleProtocolType, id: number, data: IHandlePacket): Promise<void> {
    this.logger.debug(`[${handleProtocolType}] id: ${data.header.id}, size: ${data.header.size}, seq: ${data.header.size}, data: ${JSON.stringify(data.json)}`);

    if (handleProtocolType == HandleProtocolType.UDP) {
      this.handlePacketUDP(id, data);
    } else if (handleProtocolType == HandleProtocolType.TCP) {
      this.handlePacketTCP(id, data);
    }
  }

  async handlePacketUDP(id: number, data: IHandlePacket) {
    try {
      // Check Seq
      if (data.header.seq <= this.udpService.getCurRecvSeq()) {
        return null;
      }
      this.udpService.setRecvSeq(data.header.seq);

      // Check ID
      const handler = this.handler.get(id);
      if (!handler) {
        console.warn(`[UDP] No handler found for packet ID: ${id}`);
        return null;
      }

      return handler(data);
    } catch (error) {
      console.log(`[UDP] Handle Packet Error: ${error}`);
      return null;
    }
  }

  async handlePacketTCP(id: number, data: IHandlePacket) {
    try {
      // Check ID
      const handler = this.handler.get(id);
      if (!handler) {
        console.warn(`[TCP] No handler found for packet ID: ${id}`);
        return null;
      }

      return handler(data);
    } catch (error) {
      console.log(`[TCP] Handle Packet Error: ${error}`);
      return null;
    }
  }

  // Test
  async handleTestUDP(data: IHandlePacket) {
    this.udpService.sendServerResponse(data.rinfo.address, data.rinfo.port, data.header.id, { message: `hello from Server-> ${data.json.data}}` });

    return { status: 'success', message: 'Login successful' };
  }
  async handleTestTCP(data: IHandlePacket) {
    // ECHO
    this.tcpService.sendToClient(data.header.id, JSON.stringify(data.json), data.socket);
    return;
  }

  async handleInitSeq(data: IHandlePacket) {
    try {
      this.udpService.initRecvSeq();
      this.udpService.initSendSeq();
      return true;
    } catch (error) {
      console.log(`Handle InitSeq Error: ${error}`);
      return false;
    }
  }

  async handleRecvVehicleStatus(data: IHandlePacket) {
    try {
      const velocityData = plainToInstance(VelocityStateDto, data.json);
      console.log(velocityData, 'velocityData?');
      const velocityErrors = await validate(velocityData);
      if (velocityErrors.length === 0) {
        this.socketService.sendToClientType(SendClientType.ELECTRON, 'velocityState', velocityData);
        this.socketService.sendToClientType(SendClientType.FLUTTER, 'flutterVelocityState', velocityData);
      }
      return true;
    } catch (error) {
      console.log(`Handle VehicleStatus Error: ${error}`);
      return false;
    }
  }

  async handleRecvStartAutoDrive(data: IHandlePacket) {
    console.log('handleRecvStartAutoDrive:', data);
    return { status: 'success', message: 'Login successful' };
  }

  async handleRecvDoneAutoDrive(data: IHandlePacket) {
    console.log('handleRecvDoneAutoDrive:', data);
    return { status: 'success', message: 'Login successful' };
  }

  async handleRecvStartingStatus(data: IHandlePacket) {
    console.log('handleRecvStartingStatus:', data);
  }
}
