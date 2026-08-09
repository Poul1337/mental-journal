import { UserStatus } from '../../generated/prisma/enums';
import { ErrorPath } from '../consts/error-path.const';
import { AccountNotAllowedException } from '../exceptions/custom/account-not-allowed.exception';
import { AccountNotVerifiedException } from '../exceptions/custom/account-not-verified.exception';
import { UserNotFoundException } from '../exceptions/custom/user-not-found.exception';
import { AssertUser } from '../interfaces/assert-user';

export function assertAccountCanAct(
  user: AssertUser | null,
  errorPath: ErrorPath,
) {
  if (!user) throw new UserNotFoundException(errorPath);

  if (user.status !== UserStatus.ACTIVE)
    throw new AccountNotAllowedException(errorPath);

  if (!user.emailVerified) throw new AccountNotVerifiedException(errorPath);
}
