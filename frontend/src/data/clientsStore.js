import {
  createClient as createClientRequest,
  deleteClient as deleteClientRequest,
  fetchClient,
  fetchClients,
  resendClientWelcomeEmail as resendClientWelcomeEmailRequest,
  updateClient as updateClientRequest,
} from '../api/clients.js';

let clients = [];
let loading = false;
let error = '';
let snapshot = { clients, loading, error };
const listeners = new Set();

function refreshSnapshot() {
  snapshot = { clients, loading, error };
}

function emit() {
  refreshSnapshot();
  listeners.forEach((listener) => listener());
}

export function getClientsState() {
  return snapshot;
}

export function getClients() {
  return clients;
}

export function subscribeClients(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadClients() {
  loading = true;
  error = '';
  emit();

  try {
    clients = await fetchClients();
  } catch (err) {
    error = err.message || 'Unable to load clients';
    clients = [];
  } finally {
    loading = false;
    emit();
  }

  return snapshot;
}

export function getClientById(id) {
  const target = String(id || '');
  return clients.find((client) => String(client.id) === target) || null;
}

export async function ensureClient(clientId) {
  if (!clientId) {
    throw new Error('Invalid client');
  }

  const cached = getClientById(clientId);
  if (cached) {
    return cached;
  }

  const client = await fetchClient(clientId);
  clients = [client, ...clients.filter((item) => item.id !== client.id)];
  emit();
  return client;
}

export async function addClient(payload) {
  const result = await createClientRequest(payload);
  const client = result.client;
  clients = [client, ...clients.filter((item) => item.id !== client.id)];
  emit();
  return result;
}

export async function resendWelcomeEmail(clientId) {
  const result = await resendClientWelcomeEmailRequest(clientId);
  const client = result.client;
  clients = clients.map((item) => (item.id === client.id ? client : item));
  emit();
  return result;
}

export async function updateClient(id, payload) {
  const client = await updateClientRequest(id, payload);
  clients = clients.map((item) => (item.id === id ? client : item));
  emit();
  return client;
}

export async function deleteClient(id) {
  const client = await deleteClientRequest(id);
  clients = clients.filter((item) => item.id !== id);
  emit();
  return client;
}
