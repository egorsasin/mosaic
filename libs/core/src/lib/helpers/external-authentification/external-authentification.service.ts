import { Injectable } from '@nestjs/common';

import { UserService } from '../../service/services';

@Injectable()
export class ExternalAuthenticationService {
  constructor(private userService: UserService) {}
}
