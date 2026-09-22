import crypto from 'node:crypto';

const PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

export function generateTemporaryPassword(length = 12) {
  const size = Math.max(10, Number(length) || 12);
  const bytes = crypto.randomBytes(size);
  let password = '';

  for (let index = 0; index < size; index += 1) {
    password += PASSWORD_ALPHABET[bytes[index] % PASSWORD_ALPHABET.length];
  }

  return password;
}
