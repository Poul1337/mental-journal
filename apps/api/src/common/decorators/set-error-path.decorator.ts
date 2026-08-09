import { SetMetadata } from '@nestjs/common';

import { ErrorPath } from '../consts/error-path.const';

export const ERROR_PATH_KEY = 'errorPath';
export const SetErrorPath = (path: ErrorPath) =>
  SetMetadata(ERROR_PATH_KEY, path);
