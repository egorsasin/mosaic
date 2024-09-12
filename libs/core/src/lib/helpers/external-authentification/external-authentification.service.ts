import { Injectable } from '@nestjs/common';

import { UserService } from '../../service';

@Injectable()
export class ExternalAuthenticationService {
  constructor(private userService: UserService) {}
}
