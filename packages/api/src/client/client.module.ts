import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { ClientFactory } from './client.factory'
import { GoogleClientService } from './service/google.service'
import { CommonClientService } from './service/common.service'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  providers: [CommonClientService, ClientFactory, GoogleClientService],
  exports: [ClientFactory],
})
export class ClientModule {}
