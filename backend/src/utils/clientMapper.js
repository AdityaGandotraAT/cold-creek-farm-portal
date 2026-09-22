function toISODate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value.toISOString().slice(0, 10);
  }

  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

export function rowToClient(row) {
  if (!row) {
    return null;
  }

  const firstName = row.first_name;
  const lastName = row.last_name;

  return {
    id: String(row.id),
    referenceNumber: row.reference_number,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: row.email,
    birthDate: toISODate(row.birth_date),
    primaryPhone: row.primary_phone,
    secondaryPhone: row.secondary_phone,
    phone: row.primary_phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    country: row.country,
    facebookUrl: row.facebook_url,
    twitterUrl: row.twitter_url,
    googlePlusUrl: row.google_plus_url,
    userId: row.user_id ? String(row.user_id) : null,
    welcomeEmailSentAt: row.welcome_email_sent_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    eventDate: null,
    venue: null,
    bookingStatus: null,
  };
}

export function clientInputFromBody(body) {
  return {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    birthDate: body.birthDate,
    primaryPhone: body.primaryPhone,
    secondaryPhone: body.secondaryPhone,
    address: body.address,
    city: body.city,
    state: body.state,
    zipCode: body.zipCode,
    country: body.country,
    facebookUrl: body.facebookUrl,
    twitterUrl: body.twitterUrl,
    googlePlusUrl: body.googlePlusUrl,
  };
}
