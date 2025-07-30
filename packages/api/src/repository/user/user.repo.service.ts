import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '@libs/model/user.model'



@Injectable()
export class UserRepoService {
  private readonly logger = new Logger(UserRepoService.name)

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec()
  }

  async createUser(user: User) {
    return this.userModel.create(user)
  }
}
