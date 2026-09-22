export const emptyCategoryForm = {
  name: '',
  status: 'Active',
};

export function categoryToForm(category) {
  return {
    name: category.name || '',
    status: category.status || 'Active',
  };
}

export function validateCategoryForm(values, { required = false } = {}) {
  const errors = {};

  if (!required && !String(values.name || '').trim()) {
    errors.name = 'Enter a category name.';
  }

  if (!values.status) {
    errors.status = 'Select a status.';
  } else if (!['Active', 'Inactive'].includes(values.status)) {
    errors.status = 'Select Active or Inactive.';
  }

  if (required && values.status === 'Inactive') {
    errors.status = 'Required categories must stay Active.';
  }

  return errors;
}

export function toCategoryPayload(values) {
  return {
    name: String(values.name || '').trim(),
    status: values.status,
  };
}
