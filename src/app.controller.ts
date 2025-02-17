import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAppController() {
    console.log('GET');

    const backgroundProcess = new Promise(async (resolve, reject) => {
      try {
        const result = await fetch('http://localhost:8000/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ trigger: true })
        });
        resolve(result.json());
      } catch (error) {
        reject(new Error(error));
      }
    });

    backgroundProcess.then((response) => console.log('POST Response:', response)).catch((error) => console.error('Error sending POST request:', error));

    return {
      success: true,
      message: 'GET /',
      data: {}
    };
  }

  @Post()
  async postAppController(@Body() body: any) {
    console.log('POST', body);
    return {
      success: true,
      message: 'POST /',
      data: {}
    };
  }
}
