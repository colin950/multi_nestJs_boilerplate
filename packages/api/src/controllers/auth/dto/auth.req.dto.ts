import { ApiProperty } from '@nestjs/swagger'
import { MinLength } from 'class-validator'

export class BodyDtoReqSignUpIn {
  @ApiProperty({
    description: 'Email',
    required: true,
    example: 'tester@nway.com',
  })
  email: string

  @ApiProperty({
    description: 'Password',
    required: true,
  })
  @MinLength(8)
  password: string
}
