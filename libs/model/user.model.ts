import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserStatus } from '../constant/enum'

@Schema({ collection: 'users' })
export class User {
  constructor(init?: Partial<User>) {
    Object.assign(this, init)
  }

  @Prop()
  name: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  hash: string

  @Prop({ required: true })
  salt: string

  @Prop({ default: UserStatus.ACTIVE, type: String })
  status: UserStatus

  @Prop()
  created: number

  @Prop()
  updated: number
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.index({ email: 1 }, { unique: true })
