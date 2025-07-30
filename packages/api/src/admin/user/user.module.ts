import { UserAdminController } from './user.controller'
import { Module } from '@nestjs/common'
import { UserAdminService } from './user.service'

@Module({
  imports: [],
  providers: [UserAdminService],
  controllers: [UserAdminController],
})
export class UserAdminModule {}
