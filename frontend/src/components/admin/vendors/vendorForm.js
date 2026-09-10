import { vendorCategories } from '../../../data/vendorsMock.js';

export const emptyVendorForm = {
  category: '',
  name: '',
  phone: '',
  email: '',
  website: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidPhone(value) {
  return digitsOnly(value).length === 10;
}

function normalizeWebsite(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function vendorToForm(vendor) {
  return {
    category: vendor.category || '',
    name: vendor.name || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    website: vendor.website || '',
  };
}

export function validateVendorForm(values) {
  const errors = {};

  if (!values.category) {
    errors.category = 'Select a vendor category.';
  } else if (!vendorCategories.includes(values.category)) {
    errors.category = 'Select a vendor category.';
  }

  if (!values.name.trim()) {
    errors.name = 'Enter the vendor name.';
  }

  if (values.phone.trim() && !isValidPhone(values.phone)) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.website.trim()) {
    const website = normalizeWebsite(values.website);
    if (!isValidUrl(website)) {
      errors.website = 'Enter a valid website.';
    }
  }

  return errors;
}

export function toVendorPayload(values) {
  return {
    category: values.category,
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    website: normalizeWebsite(values.website),
    status: 'Active',
  };
}
