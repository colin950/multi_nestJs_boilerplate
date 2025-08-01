import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm'
import { UserStatus } from '../../constant/enum'

@Entity({ name: 'users' })
@Index(['email'], { unique: true })
// partial index
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  hash: string

  @Column()
  salt: string

  @Column({ default: UserStatus.ACTIVE, type: String })
  status: UserStatus

  @Column()
  created: number

  @Column()
  updated: number
}
