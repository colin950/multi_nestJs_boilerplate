import { ApiProperty } from '@nestjs/swagger'
import { UserStatus } from '../../../constant/enum'

export class DtoRespSignup {
  constructor(init?: Partial<DtoRespSignup>) {
    Object.assign(this, init)
  }

  @ApiProperty({
    description: 'users status',
  })
  status: UserStatus
}
