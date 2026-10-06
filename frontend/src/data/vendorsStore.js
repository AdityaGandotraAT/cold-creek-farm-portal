import {
  createVendor as createVendorRequest,
  fetchVendor,
  fetchVendors,
  updateVendorRequest,
} from '../api/vendors.js';

let vendors = [];
let loading = false;
let error = '';
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getVendors() {
  return vendors;
}

export function subscribeVendors(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function loadVendors() {
  loading = true;
  error = '';
  emit();

  try {
    vendors = await fetchVendors();
  } catch (err) {
    error = err.message || 'Unable to load vendors';
    vendors = [];
  } finally {
    loading = false;
    emit();
  }

  return vendors;
}

export function getVendorById(id) {
  const target = String(id || '');
  return vendors.find((vendor) => String(vendor.id) === target) || null;
}

export async function ensureVendor(vendorId) {
  if (!vendorId) {
    throw new Error('Invalid vendor');
  }

  const cached = getVendorById(vendorId);
  if (cached) {
    return cached;
  }

  const vendor = await fetchVendor(vendorId);
  vendors = [vendor, ...vendors.filter((item) => item.id !== vendor.id)];
  emit();
  return vendor;
}

export async function addVendor(payload) {
  const vendor = await createVendorRequest(payload);
  vendors = [vendor, ...vendors.filter((item) => item.id !== vendor.id)];
  emit();
  return vendor;
}

export async function updateVendor(id, payload) {
  const vendor = await updateVendorRequest(id, payload);
  vendors = vendors.map((item) => (item.id === id ? vendor : item));
  emit();
  return vendor;
}

export function getVendorsLoading() {
  return loading;
}

export function getVendorsError() {
  return error;
}
