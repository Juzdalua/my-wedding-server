import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CsvService } from './csv.service';
import { WriteCsvDto } from './dto/write-dto';

@Controller('csv')
export class CsvController {
  private logger = new Logger(CsvController.name);
  constructor(private readonly csvService: CsvService) {}

  @Get('/:id')
  async getCsv(@Param('id') id: number) {
    if (isNaN(id)) {
      this.logger.error(`Invalid id: ${id}`);
      return null;
    }
    return this.csvService.loadRecentFile(id);
  }

  @Post('/append')
  async writeCsvAppend(@Body() writeCsvDto: WriteCsvDto) {
    let idx = 1;
    setInterval(async () => {
      if (idx >= 210) {
        await this.csvService.closeFile();
        return;
      }
      this.csvService.addAppendData(1, 'KIM', { value1: Math.random() * 100, value2: Math.random() * 100 });
      idx++;
    }, 500);
  }

  @Post('/once')
  async writeCsvOnce(@Body() writeCsvDto: WriteCsvDto) {
    const id = 4;
    const name = 'K';
    const data = [];
    for (let i = 0; i < 3000; i++) {
      data.push({ value1: Math.random() * 100, value2: Math.random() * 100 });
    }

    this.csvService.saveDataOnce(id, name, data);
  }
}
