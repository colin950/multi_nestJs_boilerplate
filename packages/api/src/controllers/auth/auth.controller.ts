import {
  Body,
  Controller,
  Post,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger'

import { AuthService } from '../../services/auth/auth.service'
import { UserService } from '../../services/user/user.service'
import { BodyDtoReqSignUpIn } from './dto/auth.req.dto'
import { DtoRespSignup } from './dto/auth.resp.dto'
import { UserStatus } from '../../constant/enum'
import { Err } from '../../errors/err'
import { ConfigService } from '@nestjs/config'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'sign up' })
  @ApiOkResponse({ status: 200, description: 'success to sign up' })
  @ApiResponse({ status: 400, description: 'invalid param' })
  @Post('/signup')
  async SignUp(@Body() bodyDto: BodyDtoReqSignUpIn) {
    const salt = this.authService.genSalt()
    const hashedPw = this.authService.hashPassword(bodyDto.password, salt)

    await this.userService.createUser(bodyDto.email, hashedPw, salt)

    return new DtoRespSignup({
      status: UserStatus.ACTIVE,
    })
  }

  @ApiOperation({ summary: 'sign in' })
  @ApiOkResponse({ status: 200, description: 'success to sign in' })
  @ApiResponse({ status: 400, description: JSON.stringify([Err.InvalidParam]) })
  @ApiResponse({ status: 404, description: 'users not found' })
  @ApiResponse({ status: 422, description: 'invalid password' })
  @Post('/signin')
  async SignIn(@Body() bodyDto: BodyDtoReqSignUpIn) {
    const user = await this.userService.getUserByEmail(bodyDto.email)
    if (user == null) {
      throw new NotFoundException(Err.NotFound)
    }
    const isValid = this.authService.validatePassword(
      bodyDto.password,
      user.hash,
      user.salt,
    )
    this.configService.get('networks')
    if (!isValid) {
      throw new BadRequestException(Err.InvalidParam)
    }
    // return some services-value
  }

  @Post('/test')
  async test() {
    console.log('test')
  }

  @Post('/test/error')
  async testError() {
    throw new Error('error')
  }
}
