import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CdtDto } from './dto/cdt.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    console.log(123)
    throw new HttpException("error", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
