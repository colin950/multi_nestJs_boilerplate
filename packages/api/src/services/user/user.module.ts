import { DynamicModule, Module } from '@nestjs/common'
import { UserService } from './user.service'
import { ConfigModule } from '@nestjs/config'
import { UserRepoModule } from '../../repository/user/user.repo.module'

@Module({
  imports: [ConfigModule.forRoot()],
})
export class UserModule {
  static forAsync(): DynamicModule {
    return {
      module: UserModule,
      imports: [UserRepoModule],
      providers: [UserService],
      exports: [UserService],
    }
  }
}
