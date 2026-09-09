import { login } from '../services/authService.js';
import { toPublicUser } from '../utils/toPublicUser.js';

export async function postLogin(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body || {};
    const result = await login({ email, password, rememberMe });

    res.status(200).json({
      status: 'ok',
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

export function getMe(req, res) {
  res.status(200).json({
    status: 'ok',
    user: toPublicUser(req.user),
  });
}

export function getAdminCheck(req, res) {
  res.status(200).json({
    status: 'ok',
    role: req.user.role,
  });
}

export function getClientCheck(req, res) {
  res.status(200).json({
    status: 'ok',
    role: req.user.role,
  });
}
