import { ApiTags } from '@nestjs/swagger'
import { Controller } from '@nestjs/common'

@ApiTags('User-Admin')
@Controller()
export class UserAdminController {
  constructor() {}
}
