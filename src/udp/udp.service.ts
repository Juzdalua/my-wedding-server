import { Injectable } from '@nestjs/common';
import * as dgram from 'dgram';

@Injectable()
export class UdpService {
  private client: dgram.Socket;
  private globalSequence: number = 0;

  constructor() {
    this.client = dgram.createSocket('udp4');
  }

  listenForMessages() {
    this.client.on('message', (msg, rinfo) => {
      const ue5Host = rinfo.address;
      const ue5Port = rinfo.port;
      // if(ue5Host != process.env.UE5_HOST || ue5Port != Number(process.env.UE5_PORT)) return;

      const headerSize = 12;
      const headerBuffer = msg.subarray(0, headerSize);
      const header = this.parseHeader(headerBuffer);
      console.log(header);
      const { size, id, seq } = header;

      const jsonData = msg.subarray(headerSize).toString();
      console.log('Json String:', jsonData);

      try {
        const jsonObject = JSON.parse(jsonData);
        console.log('Parsed JSON:', jsonObject);
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    });

    // 수신할 포트와 호스트 설정
    this.client.bind(1998, '127.0.0.1', () => {
      // this.client.bind(Number(process.env.UE5_PORT), process.env.UE5_HOST, () => {
      console.log(`✅ Success Listen UDP Server`);
    });
  }

  parseHeader(headerBuffer: Buffer) {
    return {
      size: headerBuffer.readUInt32LE(0),
      id: headerBuffer.readUInt32LE(4),
      seq: headerBuffer.readUInt32LE(8)
    };
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

  sendMessage(id: number, seq: number, body: object) {
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
