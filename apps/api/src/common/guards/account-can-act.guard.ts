import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  FIND_USER_BY_ID_PORT,
  FindUserByIdPort,
} from '../../modules/user/interfaces/find-user-by-id.port';
import { ErrorPath } from '../const/error-path.const';
import { AuthUser } from '../decorators/current-user.decorator';
import { ERROR_PATH_KEY } from '../decorators/set-error-path.decorator';
import { UnauthorizedUserException } from '../exceptions/custom/unauthorized-user.exception';
import { assertAccountCanAct } from '../utils/assert-account-can-act.util';

@Injectable()
export class AccountCanActGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @Inject(FIND_USER_BY_ID_PORT)
    private readonly findUserByIdPort: FindUserByIdPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const userId = req.user?.userId;

    if (!userId) throw new UnauthorizedUserException(ErrorPath.AUTH);

    const user = await this.findUserByIdPort.execute(userId);

    const errorPath =
      this.reflector.getAllAndOverride<ErrorPath>(ERROR_PATH_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? ErrorPath.JOURNAL;

    assertAccountCanAct(user, errorPath);

    return true;
  }
}
