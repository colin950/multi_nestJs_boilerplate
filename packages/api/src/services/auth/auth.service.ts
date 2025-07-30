import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor() {}

  genSalt() {
    return crypto.randomBytes(16).toString('base64')
  }

  hashPassword(pw: string, salt: string) {
    return crypto.pbkdf2Sync(pw, salt, 1000, 64, `sha512`).toString(`hex`)
  }

  validatePassword(pw: string, hash: string, salt: string) {
    const comp = this.hashPassword(pw, salt)
    return comp === hash
  }
}
