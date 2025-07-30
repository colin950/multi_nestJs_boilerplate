import { Module } from '@nestjs/common'
import { UserRepoService } from './user.repo.service'
import { ReferralCode, User } from '@libs/model'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([User, ReferralCode])],
  providers: [UserRepoService],
  exports: [UserRepoService],
})
export class UserRepoModule {}
