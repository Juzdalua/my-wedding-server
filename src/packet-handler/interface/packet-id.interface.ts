import * as dgram from 'dgram';
import * as net from 'net';

export interface PacketHeader {
  size: number;
  id: number;
  seq: number;
}

export interface IHandlePacket {
  header: PacketHeader;
  json: any;
  rinfo?: dgram.RemoteInfo;
  socket?: net.Socket;
}

/**
 * 5000번대: IVI -> UE5,
 * 7000번대: UE5 -> IVI,
 * 6000번대: Seatingbuck -> UE5,
 */
export enum PacketId {
  SEND_SET_INFO_FROM_APP = 5001, // 시작 설정

  RECV_VEHICLE_STATUS = 7001, // velocity, gear
  RECV_START_AUTO_DRIVE = 7002,
  RECV_DONE_AUTO_DRIVE = 7003,
  RECV_STARTING_STATUS = 7004,
}
