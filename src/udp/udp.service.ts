import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dgram from 'dgram';
import { PacketHandlerService } from '../packet-handler/packet-handler.service';
import { HandleProtocolType } from '@/packet-handler/interface/packet-types';

@Injectable()
export class UdpService {
  private client: dgram.Socket;
  private server: dgram.Socket;
  private sendSeq: number = 1;
  private recvSeq: number = 0;

  constructor(
    @Inject(forwardRef(() => PacketHandlerService))
    private readonly packetHandlerService: PacketHandlerService,
  ) {
    this.client = dgram.createSocket('udp4');
    this.server = dgram.createSocket('udp4');
  }

  //////////////////////////////////////////////////
  // Seq
  //////////////////////////////////////////////////
  initSendSeq() {
    this.sendSeq = 1;
  }

  getCurSendSeq(): number {
    return this.sendSeq;
  }

  getNextSendSeq(): number {
    return ++this.sendSeq;
  }

  initRecvSeq() {
    this.recvSeq = 0;
  }

  getCurRecvSeq(): number {
    return this.recvSeq;
  }

  setRecvSeq(seq: number): number {
    this.recvSeq = seq;
    return this.recvSeq;
  }

  //////////////////////////////////////////////////
  // Common
  //////////////////////////////////////////////////
  parseHeader(headerBuffer: Buffer) {
    return {
      size: headerBuffer.readUInt32LE(0),
      id: headerBuffer.readUInt32LE(4),
      seq: headerBuffer.readUInt32LE(8),
    };
  }

  parseFromRecvBuffer(buffer: Buffer) {
    const headerSize = 12;
    if (buffer.length <= headerSize) {
      return;
    }
    const headerBuffer = buffer.subarray(0, headerSize);
    const header = this.parseHeader(headerBuffer);
    // console.log(header);
    const { size, id, seq } = header;

    const jsonData = buffer.subarray(headerSize).toString();
    // console.log('Json String:', jsonData);

    try {
      const jsonObject = JSON.parse(jsonData);
      // console.log('Parsed JSON:', jsonObject);

      return {
        header,
        json: jsonObject,
      };
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return null;
    }
  }

  createHeader(id: number, seq: number, size: number): Buffer {
    const header = Buffer.alloc(12); // 12바이트 크기의 버퍼 할당

    // 헤더에 데이터 삽입 (순서: size, id, seq)
    header.writeUInt32LE(size, 0); // size: 4바이트
    header.writeUInt32LE(id, 4); // id: 4바이트
    header.writeUInt32LE(seq, 8); // seq: 4바이트

    return header;
  }

  createSendData(id: number, seq: number, body: object): Buffer {
    const jsonString = JSON.stringify(body);
    const headerSize = 12 + jsonString.length;
    const header = this.createHeader(id, seq, headerSize);
    const sendData = Buffer.concat([header, Buffer.from(jsonString, 'utf-8')]);
    return sendData;
  }

  //////////////////////////////////////////////////
  // Server
  //////////////////////////////////////////////////
  startServer(host: string, port: number) {
    this.server.on('message', (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      console.log(
        `Received message: ${msg.toString()} from ${rinfo.address}:${rinfo.port}`,
      );

      const { header, json } = this.parseFromRecvBuffer(msg);
      this.packetHandlerService.handlePacket(
        HandleProtocolType.UDP,
        header.id,
        {
          header,
          json,
          rinfo,
        },
      );

      // Test Echo message
      // this.sendServerResponse(
      //   rinfo.address,
      //   rinfo.port,
      //   header.id,
      //   header.seq,
      //   {
      //     message: 'Hello from server!',
      //   },
      // );
    });

    this.server.bind(port, host, () => {
      console.log(`✅ Connect UDP Server. listening on ${host}:${port}`);
    });
  }

  sendServerResponse(address: string, port: number, id: number, data: object) {
    try {
      const sendData = this.createSendData(id, this.getNextSendSeq(), data);

      this.server.send(sendData, port, address, (err) => {
        if (err) {
          console.error('Error sending response:', err);
        } else {
          console.log('Response sent!');
        }
      });
    } catch (error) {
      console.log(`UDP Send Error: ${error}`);
    }
  }

  //////////////////////////////////////////////////
  // Client
  //////////////////////////////////////////////////
  listenForMessages() {
    this.client.on('message', (msg, rinfo) => {
      const ue5Host = rinfo.address;
      const ue5Port = rinfo.port;
      // if(ue5Host != process.env.UE5_HOST || ue5Port != Number(process.env.UE5_PORT)) return;

      const { header, json } = this.parseFromRecvBuffer(msg);
    });

    // 수신할 포트와 호스트 설정
    this.client.bind(1998, '127.0.0.1', () => {
      // this.client.bind(Number(process.env.UE5_PORT), process.env.UE5_HOST, () => {
      console.log(`✅ Success Listen UDP Server`);
    });
  }

  sendClientMessage(id: number, seq: number, body: object) {
    const sendData = this.createSendData(id, seq, body);
    const serverPort = 1998;
    const serverIP = '127.0.0.1';
    // const serverPort = Number(process.env.UE5_PORT);
    // const serverIP = process.env.UE5_HOST;

    this.client.send(sendData, serverPort, serverIP, (err) => {
      if (err) {
        console.error('Error sending UDP message:', err);
      } else {
        // console.log('UDP message sent!');
      }
    });
  }

  closeClient() {
    this.client.close();
  }
}
