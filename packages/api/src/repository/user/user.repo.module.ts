import { Module } from '@nestjs/common'
import { UserRepoService } from './user.repo.service'
import { User, UserSchema } from './user.model'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserRepoService],
  exports: [UserRepoService],
})
export class UserRepoModule {}
