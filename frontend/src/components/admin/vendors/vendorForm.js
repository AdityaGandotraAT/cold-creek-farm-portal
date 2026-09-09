import { vendorCategories, vendorStatusOptions } from '../../../data/vendorsMock.js';

export const emptyVendorForm = {
  name: '',
  company: '',
  category: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  description: '',
  services: '',
  pricing: '',
  status: 'Active',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidPhone(value) {
  return digitsOnly(value).length === 10;
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
    name: vendor.name || '',
    company: vendor.company || '',
    category: vendor.category || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    website: vendor.website || '',
    address: vendor.address || '',
    description: vendor.description || '',
    services: vendor.services || '',
    pricing: vendor.pricing || '',
    status: vendor.status || 'Active',
  };
}

export function validateVendorForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Enter a vendor name.';
  }

  if (!values.company.trim()) {
    errors.company = 'Enter a company name.';
  }

  if (!values.category) {
    errors.category = 'Select a vendor category.';
  } else if (!vendorCategories.includes(values.category)) {
    errors.category = 'Select a vendor category.';
  }

  if (!values.email.trim()) {
    errors.email = 'Enter an email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Enter a phone number.';
  } else if (!isValidPhone(values.phone)) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }

  if (values.website.trim() && !isValidUrl(values.website.trim())) {
    errors.website = 'Enter a valid URL starting with http:// or https://.';
  }

  if (!values.status) {
    errors.status = 'Select a status.';
  } else if (!vendorStatusOptions.includes(values.status)) {
    errors.status = 'Select Active or Inactive.';
  }

  return errors;
}

export function toVendorPayload(values) {
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    category: values.category,
    email: values.email.trim(),
    phone: values.phone.trim(),
    website: values.website.trim(),
    address: values.address.trim(),
    description: values.description.trim(),
    services: values.services.trim(),
    pricing: values.pricing.trim(),
    status: values.status,
  };
}
