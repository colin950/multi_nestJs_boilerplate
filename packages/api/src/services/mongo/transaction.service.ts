import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { ClientSession, Connection } from 'mongoose'
import { MongoError } from 'mongodb'
import { Err, ErrStruct } from '../../errors/err'

@Injectable()
export class MongoTransactionService {
  private readonly logger = new Logger(MongoTransactionService.name)
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async executeTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      const result = await fn(session)
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      // error.code === 11000은 duplicate key 에러
      if (error instanceof MongoError && error.code === 11000) {
        this.logger.error(
          `mongo tx err with duplicate key error: ${error.stack}`,
        )
        throw new UnprocessableEntityException(Err.MongoDuplicateKeyError)
      } else if (error.response && error.response instanceof ErrStruct) {
        throw error
      } else {
        this.logger.error(`mongo tx err: ${error.stack}`)
        throw new UnprocessableEntityException(Err.InternalServerError)
      }
    } finally {
      await session.endSession()
    }
  }
}
