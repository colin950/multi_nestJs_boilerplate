import { BadRequestException, Injectable } from '@nestjs/common'
import { ClientInterface } from './interface/client.interface'
import { Err } from '../errors/err'
import { CommonClientService } from './service/common.service'
import { ServiceName } from '../constant'

@Injectable()
export class ClientFactory {
  constructor(
    private readonly commonClientService: CommonClientService,
  ) {}

  getClientService(serviceName: ServiceName): ClientInterface {
    switch (serviceName) {
      case ServiceName.COMMON:
        return this.commonClientService
      default:
        throw new BadRequestException(Err.NotSupport)
    }
  }
}
