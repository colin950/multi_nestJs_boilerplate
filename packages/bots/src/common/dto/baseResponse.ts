import { ApiProperty } from '@nestjs/swagger'

import { Err, ErrStruct } from '../../errors/err'

export class IBaseResponse<T> {
  @ApiProperty({
    description: 'error code with description',
    type: ErrStruct,
  })
  error: ErrStruct = Err.None

  @ApiProperty({
    description: 'real data',
  })
  data?: T
}
