import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from '../../services/auth/auth.module'
import { AuthController } from './auth.controller'
import { UserModule } from '../../services/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule.forAsync(),
    UserModule.forAsync(),
  ],
  controllers: [AuthController],
})
export class AuthControllerModule {}
