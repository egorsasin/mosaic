import { Injectable } from '@nestjs/common';

import { UserService } from '../../services/user.service';

@Injectable()
export class ExternalAuthenticationService {
  constructor(private userService: UserService) {}
}
