import { Test, TestingModule } from '@nestjs/testing';
import { UdpController } from './udp.controller';

describe('UdpController', () => {
  let controller: UdpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UdpController],
    }).compile();

    controller = module.get<UdpController>(UdpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
