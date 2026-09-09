import {
  isFarmISODate,
  isFarmISOOnOrBeforeToday,
} from '../../../data/farmTime.js';

export const emptyClientForm = {
  firstName: '',
  lastName: '',
  email: '',
  birthDate: '',
  primaryPhone: '',
  secondaryPhone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  facebookUrl: '',
  twitterUrl: '',
  googlePlusUrl: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidPhone(value) {
  const digits = digitsOnly(value);
  return digits.length === 10;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateClientForm(values) {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Enter a first name.';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Enter a last name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Enter an email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.birthDate) {
    if (!isFarmISODate(values.birthDate)) {
      errors.birthDate = 'Enter a valid birth date.';
    } else if (!isFarmISOOnOrBeforeToday(values.birthDate)) {
      errors.birthDate = 'Birth date cannot be in the future.';
    }
  }

  if (!values.primaryPhone.trim()) {
    errors.primaryPhone = 'Enter a primary phone number.';
  } else if (!isValidPhone(values.primaryPhone)) {
    errors.primaryPhone = 'Enter a valid 10-digit phone number.';
  }

  if (values.secondaryPhone.trim() && !isValidPhone(values.secondaryPhone)) {
    errors.secondaryPhone = 'Enter a valid 10-digit phone number.';
  }

  if (!values.address.trim()) {
    errors.address = 'Enter an address.';
  }

  if (!values.city.trim()) {
    errors.city = 'Enter a city.';
  }

  if (!values.state.trim()) {
    errors.state = 'Enter a state.';
  }

  if (!values.zipCode.trim()) {
    errors.zipCode = 'Enter a ZIP code.';
  } else if (!/^\d{5}(?:-\d{4})?$/.test(values.zipCode.trim())) {
    errors.zipCode = 'Enter a valid ZIP code.';
  }

  if (!values.country.trim()) {
    errors.country = 'Enter a country.';
  }

  if (values.facebookUrl.trim() && !isValidUrl(values.facebookUrl.trim())) {
    errors.facebookUrl = 'Enter a valid URL starting with http:// or https://.';
  }

  if (values.twitterUrl.trim() && !isValidUrl(values.twitterUrl.trim())) {
    errors.twitterUrl = 'Enter a valid URL starting with http:// or https://.';
  }

  if (values.googlePlusUrl.trim() && !isValidUrl(values.googlePlusUrl.trim())) {
    errors.googlePlusUrl = 'Enter a valid URL starting with http:// or https://.';
  }

  return errors;
}

export function toClientPayload(values) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    birthDate: values.birthDate || null,
    primaryPhone: values.primaryPhone.trim(),
    secondaryPhone: values.secondaryPhone.trim() || null,
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    zipCode: values.zipCode.trim(),
    country: values.country.trim(),
    facebookUrl: values.facebookUrl.trim() || null,
    twitterUrl: values.twitterUrl.trim() || null,
    googlePlusUrl: values.googlePlusUrl.trim() || null,
  };
}
