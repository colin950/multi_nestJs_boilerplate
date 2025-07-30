import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { AuthService } from '../services/auth/auth.service'

@Injectable()
export class WebJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()

    req.payload = {}
    return true
  }
}
