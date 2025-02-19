import { HandleProtocolType } from '@/packet-handler/interface/packet-types';
import { PacketHandlerService } from '@/packet-handler/packet-handler.service';
import { SocketService } from '@/socket/socket.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TcpService {
  private readonly logger = new Logger(TcpService.name);
  private server: net.Server;

  constructor(
    private readonly socketService: SocketService,

    @Inject(forwardRef(() => PacketHandlerService))
    private readonly packetHandlerService: PacketHandlerService
  ) {
    this.server = net.createServer((socket) => {
      this.handleConnection(socket);
    });
  }

  //////////////////////////////////////////////////////
  // Common
  //////////////////////////////////////////////////////
  parseFromRecvBuffer(socket: net.Socket, recvBuffer: Buffer) {
    let buffer = Buffer.alloc(0);
    try {
      // 새로운 데이터를 버퍼에 추가
      buffer = Buffer.concat([buffer, recvBuffer]);

      const header = {
        id: 0,
        size: 0,
        seq: 0
      };

      while (buffer.length >= 12) {
        const size = buffer.readUInt32LE(0);
        const id = buffer.readUInt32LE(4);
        const seq = buffer.readUInt32LE(8);
        header.size = size;
        header.id = id;
        header.seq = seq;

        if (buffer.length < size) {
          break;
        }

        const jsonBuffer = buffer.subarray(12, size);
        buffer = buffer.subarray(size);

        const jsonString = jsonBuffer.toString('utf8').trim();
        const jsonObject = JSON.parse(jsonString);

        return {
          header,
          json: jsonObject
        };
      }
    } catch (err) {
      console.error('[TCP Server] Error handling data:', err);
      console.error('[TCP Server] Buffer contents:', buffer.toString('hex')); // 디버깅용
    }
  }

  //////////////////////////////////////////////////////
  // Server
  //////////////////////////////////////////////////////
  async startServer(host: string, port: number): Promise<void> {
    this.server.listen(port, host, () => {
      console.log(`✅ Connect TCP Server. listening on ${host}:${port}`);
    });

    this.server.on('error', (err) => {
      console.error(`[TCP Server] Error: ${err.message}`);
    });
  }

  private handleConnection(socket: net.Socket): void {
    this.logger.debug(`[Client connected] ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', async (data) => {
      this.logger.debug(`[RECV] ${socket.remoteAddress}:${socket.remotePort}`);
      const { header, json } = await this.parseFromRecvBuffer(socket, data);

      this.packetHandlerService.handlePacket(HandleProtocolType.TCP, header.id, {
        header,
        json,
        socket
      });
    });

    socket.on('end', () => {
      this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
    });

    socket.on('error', (err) => {
      console.error('[TCP Server] Socket error:', err.message);
      if (err.message == 'read ECONNRESET') {
        this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
      }
    });
  }

  sendToClient(id: number, jsonString: string, socket: net.Socket) {
    try {
      if (!socket || socket.destroyed || !socket.remoteAddress || !socket.remotePort) {
        this.logger.error(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
      }

      this.logger.debug(`[SEND] ${socket.remoteAddress}:${socket.remotePort}`);
      console.log(`[TCP] Sending message: ${jsonString}`);

      const jsonBuffer = Buffer.from(jsonString);
      const header = Buffer.alloc(12);
      const totalSize = header.length + jsonBuffer.length;

      header.writeUInt32LE(totalSize, 0);
      header.writeUInt32LE(id, 4);

      const packetBuffer = Buffer.concat([header, jsonBuffer]);

      socket.write(packetBuffer, (err) => {
        if (err) {
          this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
          this.logger.error(err);
        }
      });

      socket.once('error', (err) => {
        if (err.message === 'read ECONNRESET') {
          this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
        } else {
          this.logger.error(err);
        }
      });
    } catch (error) {
      console.error('Error in sendToClient:', error.message);
    }
  }
}
