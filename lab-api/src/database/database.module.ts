import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: db.host,
        port: Number(db.port),
        username: db.username,
        password: db.password,
        database: db.database,
        autoLoadEntities: true,
        synchronize: true,
        dropSchema: db.resetOnBoot,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}