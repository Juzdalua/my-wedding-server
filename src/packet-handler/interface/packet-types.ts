import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export enum SendClientType {
  ELECTRON = 'electron',
  FLUTTER = 'flutter'
}

export enum HandleProtocolType {
  TCP = 'TCP',
  UDP = 'UDP'
}

export class VelocityData {
  @IsNumber()
  velocity: number;

  @IsNumber()
  angle: number;

  @IsNumber()
  offsetX: number;

  @IsNumber()
  offsetY: number;

  @IsString()
  gear: string;
}

export class VelocityStateDto {
  @ValidateNested()
  @Type(() => VelocityData)
  result: VelocityData;
}
