import { Injectable, Logger } from '@nestjs/common'
import { User } from '@libs/model'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ZerionWebhookRegisteredStatus } from '@libs/constant'

@Injectable()
export class UserRepoService {
  private readonly logger = new Logger(UserRepoService.name)
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getWebhookPendingUsers(limit: number = 5): Promise<User[]> {
    return this.userRepo.find({
      where: { webhookRegister: ZerionWebhookRegisteredStatus.Pending },
      take: limit,
    })
  }

  async getWebhookFailedUsers(limit: number = 5): Promise<User[]> {
    return this.userRepo.find({
      where: { webhookRegister: ZerionWebhookRegisteredStatus.Failed },
      take: limit,
    })
  }

  async saveUsers(users: User[]) {
    await this.userRepo.save(users)
  }
}
