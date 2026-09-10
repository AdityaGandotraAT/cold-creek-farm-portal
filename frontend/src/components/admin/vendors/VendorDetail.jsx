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

function VendorDetail({ vendor }) {
  return (
    <section className="client-form__section vendor-detail">
      <div className="vendor-detail__heading">
        <h3>{vendor.name}</h3>
      </div>
      <dl className="vendor-detail__grid">
        <DetailItem label="Category" value={vendor.category} />
        <DetailItem label="Name" value={vendor.name} />
        <DetailItem
          label="Phone"
          value={vendor.phone}
          href={vendor.phone ? `tel:${vendor.phone}` : undefined}
        />
        <DetailItem
          label="Email"
          value={vendor.email}
          href={vendor.email ? `mailto:${vendor.email}` : undefined}
        />
        <DetailItem label="Website" value={vendor.website} href={vendor.website || undefined} wide />
      </dl>
    </section>
  );
}

export default VendorDetail;
