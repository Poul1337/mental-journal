export const ANON_NAME_MIN_LENGTH = 3;
export const ANON_NAME_MAX_LENGTH = 24;
export const ANON_NAME_REGEX: RegExp = new RegExp(
  `^[a-zA-Z0-9_]{${ANON_NAME_MIN_LENGTH},${ANON_NAME_MAX_LENGTH}}$`,
);
