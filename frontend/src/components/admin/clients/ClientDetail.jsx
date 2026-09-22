import { formatEventDate } from '../dashboard/format.js';

function DetailItem({ label, value, wide = false, href }) {
  const display = value || '—';

  return (
    <div className={`vendor-detail__item${wide ? ' is-wide' : ''}`}>
      <dt>{label}</dt>
      <dd>
        {href && value ? (
          <a href={href} target="_blank" rel="noreferrer">
            {display}
          </a>
        ) : (
          display
        )}
      </dd>
    </div>
  );
}

function ClientDetail({ client }) {
  const addressLine = [client.city, client.state, client.zipCode].filter(Boolean).join(', ');
  const birthDateLabel = client.birthDate ? formatEventDate(client.birthDate) : '';

  return (
    <>
      <section className="client-form__section vendor-detail">
        <div className="vendor-detail__heading">
          <h3>{client.name}</h3>
          <p className="clients-table__ref">{client.referenceNumber}</p>
        </div>
        <dl className="vendor-detail__grid">
          <DetailItem label="First Name" value={client.firstName} />
          <DetailItem label="Last Name" value={client.lastName} />
          <DetailItem
            label="Email"
            value={client.email}
            href={client.email ? `mailto:${client.email}` : undefined}
          />
          <DetailItem
            label="Primary Phone"
            value={client.primaryPhone}
            href={client.primaryPhone ? `tel:${client.primaryPhone}` : undefined}
          />
          <DetailItem label="Secondary Phone" value={client.secondaryPhone} />
          <DetailItem label="Birth Date" value={birthDateLabel || null} />
          <DetailItem label="Address" value={client.address} wide />
          <DetailItem label="City / State / ZIP" value={addressLine} wide />
          <DetailItem label="Country" value={client.country} />
        </dl>
      </section>

      <section className="client-form__section vendor-detail">
        <h3>Social</h3>
        <dl className="vendor-detail__grid">
          <DetailItem label="Facebook" value={client.facebookUrl} href={client.facebookUrl || undefined} wide />
          <DetailItem label="Twitter" value={client.twitterUrl} href={client.twitterUrl || undefined} wide />
          <DetailItem
            label="Google+"
            value={client.googlePlusUrl}
            href={client.googlePlusUrl || undefined}
            wide
          />
        </dl>
      </section>
    </>
  );
}

export default ClientDetail;
