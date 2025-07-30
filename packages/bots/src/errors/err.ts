import { ApiProperty } from '@nestjs/swagger'

export class ErrStruct {
  constructor(code: number, text: string, detail: string = '') {
    this.code = code
    this.text = text
    this.detail = detail
  }

  @ApiProperty({
    description: 'custom err code',
  })
  code: number = 1000

  @ApiProperty({
    description: 'custom code desc',
  })
  text: string = 'internal server err'

  @ApiProperty({
    description: 'custom err detail',
  })
  detail: string = ''

  setDetail(desc: string): ErrStruct {
    return new ErrStruct(this.code, this.text, desc)
  }
}

export const Err = {
  None: new ErrStruct(0, ''),

  InvalidParam: new ErrStruct(4000, 'Invalid param'),
  NotFound: new ErrStruct(4001, 'Not found'),
  NotSupport: new ErrStruct(4002, 'Not support'),
  InvalidAddress: new ErrStruct(4003, 'Invalid address'),
  InternalServerError: new ErrStruct(4005, 'internal server error'),
  MongoDuplicateKeyError: new ErrStruct(4006, 'Duplicate key error'),

  // sql
  EmptyUpdate: new ErrStruct(6000, 'Empty update not allowed'),

  WebhookAlreadyRegistered: new ErrStruct(7000, 'Webhook already registered'),
}
