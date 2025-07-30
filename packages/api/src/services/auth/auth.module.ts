import { DynamicModule, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ConfigModule } from '@nestjs/config'
import { UserRepoModule } from '../../repository/user/user.repo.module'

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AuthModule {
  static forAsync(): DynamicModule {
    return {
      module: AuthModule,
      imports: [UserRepoModule],
      providers: [AuthService],
      exports: [AuthService],
    }
  }
}
