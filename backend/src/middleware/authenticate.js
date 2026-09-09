import { findUserById } from '../services/authService.js';
import { HttpError } from '../utils/httpError.js';
import { verifyAuthToken } from '../utils/token.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Invalid or missing token');
    }

    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);

    if (!user || user.status !== 'active') {
      throw new HttpError(401, 'Invalid or missing token');
    }

    req.user = user;
    delete req.user.password_hash;
    next();
  } catch (err) {
    next(err);
  }
}
