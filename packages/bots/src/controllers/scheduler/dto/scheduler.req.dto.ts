import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class DtoRespPostScheduler {
  @ApiProperty({ description: 'job name' })
  @IsString()
  @IsNotEmpty()
  name: string
}
