import { Injectable } from '@nestjs/common'

import { UserRepoService } from '../../repository/user/user.repo.service'
import { User } from '@libs/model/user.model'

@Injectable()
export class UserService {
  constructor(private readonly userRepoService: UserRepoService) {}

  async getUserByEmail(email: string) {
    return this.userRepoService.getUserByEmail(email)
  }
  async createUser(email: string, hash: string, salt: string) {
    const now = Date.now()
    await this.userRepoService.createUser(
      new User({
        email,
        hash,
        salt,
        updated: now,
        created: now,
      }),
    )
  }
}
