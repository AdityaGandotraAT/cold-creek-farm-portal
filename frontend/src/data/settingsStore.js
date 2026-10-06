import { fetchSettings, saveSettingsRequest } from '../api/settings.js';
import { setVendorSelectionLockDays } from './vendorSelectionLock.js';

let settings = null;
let loading = false;
let error = '';
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getPortalSettingsState() {
  return settings;
}

export function subscribePortalSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadPortalSettings() {
  loading = true;
  error = '';
  emit();
  try {
    settings = await fetchSettings();
    setVendorSelectionLockDays(settings.vendorLockDays);
  } catch (err) {
    error = err.message || 'Unable to load settings';
  } finally {
    loading = false;
    emit();
  }
  return settings;
}

export async function savePortalSettings(payload) {
  settings = await saveSettingsRequest(payload);
  setVendorSelectionLockDays(settings.vendorLockDays);
  emit();
  return settings;
}

export function getPortalSettingsLoading() {
  return loading;
}

export function getPortalSettingsError() {
  return error;
}
