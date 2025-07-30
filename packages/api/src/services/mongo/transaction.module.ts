import { MongoTransactionService } from './transaction.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [MongooseModule],
  providers: [MongoTransactionService],
  exports: [MongoTransactionService],
})
export class MongoTransactionModule {}
