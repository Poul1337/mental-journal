import ms from 'ms';

export function parseTtlMs(value: string, envKey: string) {
  const parsed = ms(value);

  if (typeof parsed !== 'number') {
    throw new Error(`Invalid ${envKey}: Value "${value}"`);
  }

  return parsed;
}
