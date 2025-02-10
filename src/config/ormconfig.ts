import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const ormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  // entities: process.env.NODE_ENV !== 'production' ? ['dist/**/*.entity{.ts,.js}'] : ['src/**/*.entity{.ts,.js}'],
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: process.env.NODE_ENV !== 'production'
};

export default ormConfig;
