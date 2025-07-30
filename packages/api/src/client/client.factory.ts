import { BadRequestException, Injectable } from '@nestjs/common'
import { ServiceName } from '../constant/enum'
import { ClientInterface } from './interface/client.interface'
import { GoogleClientService } from './service/google.service'
import { Err } from '../errors/err'
import { CommonClientService } from './service/common.service'

@Injectable()
export class ClientFactory {
  constructor(
    private readonly commonClientService: CommonClientService,
    private readonly googleClientService: GoogleClientService,
  ) {}

  getClientService(serviceName: ServiceName): ClientInterface {
    switch (serviceName) {
      case ServiceName.COMMON:
        return this.commonClientService
      case ServiceName.GOOGLE:
        return this.googleClientService
      default:
        throw new BadRequestException(Err.NotSupport)
    }
  }
}
