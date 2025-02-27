import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CsvService {
  private buffer: string[] = [];
  private readonly batchSize = 100; // 버퍼 저장 크기

  private writeStream: fs.WriteStream | null = null;
  private filePath: string | null = null;
  private currentDate: string;
  private logger = new Logger(CsvService.name);

  csvCamData = [];
  csvCarData = [];
  customerId: number;

  constructor() {
    this.currentDate = this.getCurrentDate();
  }

  // 현재 날짜 (YYYY-MM-DD) 가져오기
  private getCurrentDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // 오늘 날짜 폴더 경로 가져오기
  private getFolderPath(): string {
    // return path.join(__dirname, `../../csv/${this.currentDate}`);
    return path.resolve(process.cwd(), `csv/${this.currentDate}`);
  }

  // 파일 초기화 및 스트림 생성
  private initializeFile(id: number, name: string, header: string) {
    this.logger.debug(`[Save] Start CSV`);
    try {
      const newDate = this.getCurrentDate();
      if (newDate !== this.currentDate) {
        this.currentDate = newDate;
      }

      const folderPath = this.getFolderPath();
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const now = new Date();
      now.setHours(now.getHours() + 9);

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const timeStamp = `${hours}-${minutes}-${seconds}`;

      this.filePath = path.join(
        folderPath,
        `${id.toString()}_${name}_${timeStamp}.csv`,
      );

      this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });

      // this.writeStream.write('timestamp,value1,value2\n'); // 헤더 추가
      this.writeStream.write(header + '\n'); // 헤더 추가
    } catch (error) {
      this.logger.error(`[Save] Init Error: ${error}`);
    }
  }

  /////////////////////////////////////////////////////////////////////
  // 배치사이즈만큼씩 메모리에 모아서 파일 저장 - 모든 데이터 보존이 필요한 경우
  /////////////////////////////////////////////////////////////////////
  addAppendData(
    id: number,
    name: string,
    data: { value1: number; value2: number },
    header: string,
  ) {
    try {
      if (!this.writeStream) {
        this.initializeFile(id, name, header);
      }

      const row = `${Date.now()},${data.value1},${data.value2}`;
      this.buffer.push(row);

      if (this.buffer.length >= this.batchSize) {
        this.flushToFile();
      }
    } catch (error) {
      console.error(`데이터 추가 중 오류 발생: ${error}`);
    }
  }

  // 버퍼 데이터를 파일에 저장
  private flushToFile() {
    if (!this.writeStream || this.buffer.length === 0) return;

    try {
      const dataToWrite = this.buffer.join('\n') + '\n';
      this.buffer = [];

      this.writeStream.write(dataToWrite, (err) => {
        if (err) {
          console.error(`파일 쓰기 중 오류 발생: ${err}`);
        }
      });
    } catch (error) {
      console.error(`flushToFile 실행 중 오류 발생: ${error}`);
    }
  }

  // 서버 종료 시 파일 닫기
  async closeFile() {
    try {
      if (this.buffer.length > 0) {
        this.flushToFile();
      }
      this.writeStream?.end();
    } catch (error) {
      console.error(`파일 닫기 중 오류 발생: ${error}`);
    }
  }

  /////////////////////////////////////////////////////////////////////
  // 한번에 저장 - 중간 데이터가 필요 없을 경우우
  /////////////////////////////////////////////////////////////////////
  saveDataOnce(id: number, name: string, data: any, header: string) {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
    this.initializeFile(id, name, header);

    const now = new Date();
    now.setHours(now.getHours() + 9); // 한국 시간 적용

    try {
      const rows = data.map((d) => d.join(',')).join('\n') + '\n';

      this.writeStream.write(rows, () => {
        this.writeStream.end(() => {
          this.logger.debug(`[Save] Done CSV`);
        });
      });
    } catch (error) {
      this.logger.error(`[Save] Save error: ${error}`);
    }
  }

  async loadRecentFile(id: number, name: string = ''): Promise<string> {
    const dirPath = this.getFolderPath(); // CsvService 구조에 맞춤

    try {
      // 디렉토리 존재 여부 확인 후 없으면 생성
      if (!fs.existsSync(dirPath)) {
        this.logger.error(`[Load] Today no has files.`);
        return '-1';
      }

      const files = fs.readdirSync(dirPath);
      let fileNameStart = `${id}_`;
      if (name && name.trim() != '') {
        fileNameStart += name;
      }

      // ID에 해당하는 파일 필터링 (예: id_1708500000000.csv)
      const matchedFiles = files
        .filter(
          (file) => file.startsWith(fileNameStart) && file.endsWith('.csv'),
        )
        .map((file) => ({
          name: file,
          timestamp: file.split('_')[2].replace('.csv', ''),
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // 최신순 정렬

      if (matchedFiles.length === 0) {
        this.logger.error(`[Load] No files found for ID: ${id}`);
        return '-2';
      }

      const recentFile = path.join(dirPath, matchedFiles[0].name);

      // 파일 읽기
      const fileContent = fs.readFileSync(recentFile, 'utf-8');
      return fileContent;
    } catch (error) {
      console.log(error);
      this.logger.error(`[Load] Error loading file for ID ${id}: ${error}`);
      return '-3';
    }
  }

  //////////////////////////////////////////////////////////
  // 메모리에 저장
  //////////////////////////////////////////////////////////
  initCSVMemoryData(customerId: number) {
    this.csvCamData = [];
    this.csvCarData = [];
    this.customerId = customerId;
  }

  saveCSVDataInMemory(type: 'cam' | 'car', data: any) {
    if (type == 'cam') {
      this.csvCamData = data;
    } else if (type == 'car') {
      this.csvCarData.push(data);
    }
  }

  //////////////////////////////////////////////////////////
  // 게임 종료 -> 메모리에서 csv로 저장
  //////////////////////////////////////////////////////////
  doneGame(customerId: number) {
    if (this.customerId == 0 || this.customerId != customerId) return;

    // this.saveDataOnce(
    //   customerId,
    //   'cam',
    //   this.csvCamData,
    //   'timestamp,ADJUSTING THE HAIR WHILE DRIVING,DISTRACTED BY OUTSIDE SCENES,DRINKING or EATING WHILE DRIVING,LOOKING BACK,NORMAL DRIVING,TALKING TO OTHER PERSON,TUNING THE RADIO WHILE DRIVING,using mobile phone',
    // );
    this.saveDataOnce(
      customerId,
      'car',
      this.csvCarData,
      'timestamp,carName,drivingDistance,drivingTime,idleTime,rpm,velocity,torque,gear,angle,acceleator,brake,hor,eor,dca,sound',
    );
  }

  mergeCsv(camCsv: Array<any>, carCsv: Array<any>) {
    const startCam = new Date(camCsv[0][0]).getTime();
    const startCar = new Date(carCsv[0][0]).getTime();
    const mergeData = [];

    if (startCam == startCar) {
      for (let i = 0; i < Math.min(camCsv.length, carCsv.length); i++) {
        mergeData[i] = [...carCsv[i], ...camCsv[i].slice(1)];
      }
      return mergeData;
    }

    const first = startCam > startCar ? 'car' : 'cam';

    const getMergeIdx = (startingCsv, waitingCsv) => {
      let mergeIdx = 1;

      while (true) {
        if (
          new Date(waitingCsv[0][0]).getTime() >
          new Date(startingCsv[mergeIdx][0]).getTime()
        ) {
          mergeIdx++;
          continue;
        }

        if (
          new Date(waitingCsv[0][0]).getTime() ==
          new Date(startingCsv[mergeIdx][0]).getTime()
        ) {
          return mergeIdx;
        }

        if (
          new Date(waitingCsv[0][0]).getTime() <
          new Date(startingCsv[mergeIdx][0]).getTime()
        ) {
          return mergeIdx - 1;
        }
      }
    };

    const mergeIdx =
      first == 'car'
        ? getMergeIdx(carCsv, camCsv)
        : getMergeIdx(camCsv, carCsv);

    const emptyCarCsv = ['', 0, 0, 0, 0, 0, 0, 'P', 0, 0, 0, 0, 0, 0, 0];
    const emptyCamCsv = [0, 0, 0, 0, 0, 0, 0, 0];

    let i = 0;
    while (true) {
      if (i == carCsv.length - 1 || i == camCsv.length - 1) {
        break;
      }

      if (i < mergeIdx) {
        if (first == 'car') {
          mergeData[i] = [...carCsv[i], ...emptyCamCsv];
        } else {
          mergeData[i] = [camCsv[i][0], ...emptyCarCsv, ...camCsv[i].slice(1)];
        }
      } else {
        mergeData[i] = [...carCsv[i], ...camCsv[i].slice(1)];
      }

      i++;
    }

    return mergeData;
  }
}
