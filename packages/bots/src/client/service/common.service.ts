import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ClientInterface } from '../interface/client.interface'
import { Err } from '../../errors/err'
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { HttpMethod } from '../../constant/enum'

import { catchError, lastValueFrom, throwError } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CommonClientService implements ClientInterface {
  private readonly logger = new Logger(CommonClientService.name)
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getCall<T>(path: string, header?: any): Promise<T> {
    return await this.commonResponseResult<T>(path, HttpMethod.GET, header)
  }

  async postCall<T, B = any>(path: string, body?: B, header?: any): Promise<T> {
    return await this.commonResponseResult<T>(
      path,
      HttpMethod.POST,
      header,
      body,
    )
  }

  private async commonResponseResult<T>(
    path: string,
    httpMethod: HttpMethod,
    header?: any,
    body?: any,
  ) {
    let res: AxiosResponse<T>
    try {
      if (httpMethod === HttpMethod.GET) {
        res = await lastValueFrom(
          this.httpService.get<T>(path, { headers: header }).pipe(
            catchError((err) => {
              return throwError(() => err)
            }),
          ),
        )
      } else if (httpMethod === HttpMethod.POST) {
        res = await lastValueFrom(
          this.httpService.post<T>(path, body, { headers: header }).pipe(
            catchError((err) => {
              return throwError(() => err)
            }),
          ),
        )
      } else {
        throw new BadRequestException(Err.NotSupport)
      }
    } catch (err) {
      if (err?.response?.data) {
        const error = JSON.stringify(err?.response?.data)
        this.logger.error({ path, header, body, error })
        throw new UnprocessableEntityException(Err.InternalServerError)
      } else {
        this.logger.error({ path, header, body, err })
        throw new UnprocessableEntityException(Err.InternalServerError)
      }
    }
    return res.data
  }
}
