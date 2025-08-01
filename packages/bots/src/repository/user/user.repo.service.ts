import { Injectable, Logger } from '@nestjs/common'
import { User } from '@libs/model/rdb/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class UserRepoService {
  private readonly logger = new Logger(UserRepoService.name)
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
}
