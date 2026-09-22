import {
  createClient,
  deleteClient,
  getClientById,
  listClients,
  resendClientWelcomeEmail,
  updateClient,
} from '../services/clientService.js';
import { HttpError } from '../utils/httpError.js';

export async function getClients(_req, res, next) {
  try {
    const clients = await listClients();
    res.status(200).json({ status: 'ok', clients });
  } catch (err) {
    next(err);
  }
}

export async function getClient(req, res, next) {
  try {
    const client = await getClientById(req.params.clientId);
    if (!client) {
      throw new HttpError(404, 'Client not found');
    }

    res.status(200).json({ status: 'ok', client });
  } catch (err) {
    next(err);
  }
}

export async function postClient(req, res, next) {
  try {
    const result = await createClient(req.body || {});
    res.status(201).json({
      status: 'ok',
      client: result.client,
      emailSent: result.emailSent,
      message: result.message,
      ...(result.temporaryPassword ? { temporaryPassword: result.temporaryPassword } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function postClientWelcomeEmail(req, res, next) {
  try {
    const result = await resendClientWelcomeEmail(req.params.clientId);
    res.status(200).json({
      status: 'ok',
      client: result.client,
      emailSent: result.emailSent,
      message: result.message,
      ...(result.temporaryPassword ? { temporaryPassword: result.temporaryPassword } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function putClient(req, res, next) {
  try {
    const client = await updateClient(req.params.clientId, req.body || {});
    res.status(200).json({ status: 'ok', client });
  } catch (err) {
    next(err);
  }
}

export async function removeClient(req, res, next) {
  try {
    const client = await deleteClient(req.params.clientId);
    res.status(200).json({
      status: 'ok',
      message: 'Client deleted',
      client,
    });
  } catch (err) {
    next(err);
  }
}
