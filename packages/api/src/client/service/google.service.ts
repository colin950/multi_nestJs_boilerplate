import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ClientInterface } from '../interface/client.interface'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { HttpMethod } from '../../constant/enum'
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces'
import { catchError, lastValueFrom, throwError } from 'rxjs'
import { Err } from '../../errors/err'

@Injectable()
export class GoogleClientService implements ClientInterface {
  private readonly logger = new Logger(GoogleClientService.name)
  private baseUrl: string
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('wlBeBaseUrl')
  }

  async getCall<T>(path: string, header?: any): Promise<T> {
    return await this.commonResponseResult<T>(path, HttpMethod.GET, header)
  }

  async postCall<T, B = any>(path: string, body?: B, header?: any): Promise<T> {
    return await this.commonResponseResult(path, HttpMethod.POST, header, body)
  }

  private async commonResponseResult<T>(
    path: string,
    httpMethod: HttpMethod,
    header?: any,
    body?: any,
  ) {
    let res: AxiosResponse<T>
    const url = this.baseUrl + path
    try {
      if (httpMethod === HttpMethod.GET) {
        res = await lastValueFrom(
          this.httpService.get<T>(url, { headers: header }).pipe(
            catchError((err) => {
              return throwError(() => err)
            }),
          ),
        )
      } else if (httpMethod === HttpMethod.POST) {
        res = await lastValueFrom(
          this.httpService.post<T>(url, body, { headers: header }).pipe(
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
        throw new UnprocessableEntityException(Err.None)
      } else {
        this.logger.error({ path, header, body, err })
        throw new UnprocessableEntityException(Err.None)
      }
    }
    return res.data
  }
}
