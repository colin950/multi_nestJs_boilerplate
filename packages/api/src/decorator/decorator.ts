import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const JwtPayload = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    const payload = req.payload
    return data ? payload?.[data] : payload
  },
)
