import { seedVendors } from './vendorsMock.js';

let vendors = seedVendors.map((vendor) => ({ ...vendor }));
let nextId = 1100;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getVendors() {
  return vendors;
}

export function getVendorById(id) {
  return vendors.find((vendor) => vendor.id === id) || null;
}

export function subscribeVendors(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addVendor(payload) {
  const vendor = {
    id: `vnd-${nextId}`,
    ...payload,
  };
  nextId += 1;
  vendors = [vendor, ...vendors];
  emit();
  return vendor;
}

export function updateVendor(id, payload) {
  const current = getVendorById(id);
  if (!current) {
    return null;
  }

  const vendor = { ...current, ...payload, id };
  vendors = vendors.map((item) => (item.id === id ? vendor : item));
  emit();
  return vendor;
}
