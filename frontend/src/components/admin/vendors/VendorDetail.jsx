import StatusBadge from '../clients/StatusBadge.jsx';
import { vendorStatusTone } from './format.js';

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
        <StatusBadge tone={vendorStatusTone(vendor.status)}>{vendor.status}</StatusBadge>
      </div>
      <dl className="vendor-detail__grid">
        <DetailItem label="Vendor Name" value={vendor.name} />
        <DetailItem label="Company" value={vendor.company} />
        <DetailItem label="Category" value={vendor.category} />
        <DetailItem label="Status" value={vendor.status} />
        <DetailItem label="Email" value={vendor.email} href={vendor.email ? `mailto:${vendor.email}` : undefined} />
        <DetailItem label="Phone" value={vendor.phone} href={vendor.phone ? `tel:${vendor.phone}` : undefined} />
        <DetailItem label="Website" value={vendor.website} href={vendor.website || undefined} wide />
        <DetailItem label="Address" value={vendor.address} wide />
        <DetailItem label="Description" value={vendor.description} wide />
        <DetailItem label="Services Offered" value={vendor.services} wide />
        <DetailItem label="Pricing / Packages" value={vendor.pricing} wide />
      </dl>
    </section>
  );
}

export default VendorDetail;
