import { HandleProtocolType } from '@/packet-handler/interface/packet-types';
import { PacketHandlerService } from '@/packet-handler/packet-handler.service';
import { SocketService } from '@/socket/socket.service';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TcpService {
  private readonly logger = new Logger(TcpService.name);
  private server: net.Server;
  private clients: Map<string, net.Socket> = new Map<string, net.Socket>();

  constructor(
    private readonly socketService: SocketService,

    @Inject(forwardRef(() => PacketHandlerService))
    private readonly packetHandlerService: PacketHandlerService
  ) {
    this.server = net.createServer((socket: net.Socket) => {
      this.handleConnection(socket);
    });

    // this.checkClientConnected();
  }

  checkClientConnected() {
    setInterval(() => {
      if (this.clients.size == 0) {
        console.log('no cli');
      } else {
        for (const [clientId, client] of this.clients) {
          console.log(client.remoteAddress, client.remotePort);
        }
      }
    }, 1000);
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

    const clientId = socket.remoteAddress + ':' + socket.remotePort;
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, socket);
    }

    socket.on('data', async (data) => {
      try {
        this.logger.debug(`[RECV] ${socket.remoteAddress}:${socket.remotePort}`);
        const { header, json } = await this.parseFromRecvBuffer(socket, data);

        this.packetHandlerService.handlePacket(HandleProtocolType.TCP, header.id, {
          header,
          json,
          socket
        });
      } catch (error) {
        console.error(`[TCP][RECV] parse error: ${error}`);
        console.error(data.toString());
      }
    });

    socket.on('end', () => {
      this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
      if (this.clients.has(clientId)) {
        this.clients.delete(clientId);
      }
    });

    socket.on('error', (err) => {
      if (err.message == 'read ECONNRESET') {
        this.logger.debug(`Client disconnected. ${socket.remoteAddress}:${socket.remotePort}`);
        if (this.clients.has(clientId)) {
          this.clients.delete(clientId);
        }
      } else {
        console.error('[TCP Server] Socket error:', err.message);
      }
    });
  }

  sendToClient = (id: number, jsonString: string, socket: net.Socket) => {
    try {
      if (this.clients.size == 0) {
        console.log('no client');
        return;
      }

      const jsonBuffer = Buffer.from(jsonString);
      const header = Buffer.alloc(12);
      const totalSize = header.length + jsonBuffer.length;

      header.writeUInt32LE(totalSize, 0);
      header.writeUInt32LE(id, 4);

      const packetBuffer = Buffer.concat([header, jsonBuffer]);

      for (const [clientId, client] of Array.from(this.clients)) {
        client.write(packetBuffer, (err) => {
          if (err) {
            if (err.message === 'read ECONNRESET') {
              this.logger.debug(`Client disconnected. ${client.remoteAddress}:${client.remotePort}`);
              this.clients.delete(clientId);
            } else {
              this.logger.error(err);
            }
          }
        });

        this.logger.debug(`[SEND] ${client.remoteAddress}:${client.remotePort}`);
        // console.log(`[TCP] Sending message: ${jsonString}`);
      }
    } catch (error) {
      console.error('Error in sendToClient:', error.message);
    }
  };
}
