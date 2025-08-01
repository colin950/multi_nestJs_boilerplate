import { Module } from '@nestjs/common'
import { UserRepoService } from './user.repo.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@libs/model/rdb/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepoService],
  exports: [UserRepoService],
})
export class UserRepoModule {}
