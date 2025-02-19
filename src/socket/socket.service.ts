import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private io: Server;
  private clients = new Map<string, string>();

  // Socket.IO 서버 초기화
  initializeSocket(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Electron 클라이언트와의 통신 허용
      },
    });

    // 클라이언트 연결 처리
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // 클라이언트 식별 등록
      socket.on('register', (data) => {
        if (data.clientType) {
          this.clients.set(socket.id, data.clientType);
          console.log(
            `Client registered: ${socket.id}, Type: ${data.clientType}`,
          );
          // this.sendToClientType('flutter', 'testEvent', {
          //   message: 'Hello Flutter!',
          // });
        }
      });

      // this.sendToClientType('electron', 'testEvent', {
      //   message: 'Hello Electron!',
      // });
      // 클라이언트 연결 해제 시 제거
      socket.on('disconnect', () => {
        this.clients.delete(socket.id);
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  sendToClientType(clientType: string, event: string, data: any) {
    let sent = false;
    for (const [socketId, type] of this.clients.entries()) {
      if (type === clientType) {
        this.io.to(socketId).emit(event, data);
        // console.log(
        //   `[Socket] Sent ${event} to ${clientType} (${socketId}):`,
        //   data,
        // );
        sent = true;
      }
    }
    if (!sent) {
      console.log(`[Socket] No ${clientType} clients found for ${event}`);
    }
  }
  // 서버에서 클라이언트로 메시지 전송
  broadcast(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}
