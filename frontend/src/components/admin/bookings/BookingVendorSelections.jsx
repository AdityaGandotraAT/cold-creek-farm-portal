import StatusBadge from '../clients/StatusBadge.jsx';
import { bookingStatusTone } from '../dashboard/format.js';
import VendorSelectionLockStatus from './VendorSelectionLockStatus.jsx';

function BookingVendorSelections({ selections, lock }) {
  return (
    <section className="client-form__section booking-selections" aria-labelledby="booking-selections-heading">
      <h3 id="booking-selections-heading">Vendor Selections</h3>
      <p className="booking-selections__hint">
        Admin monitoring only. Clients make these selections separately.
      </p>
      {lock ? <VendorSelectionLockStatus lock={lock} /> : null}

      <div className="clients-table-wrap booking-selections__table-wrap">
        <table className="clients-table booking-selections__table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Selected Vendor</th>
              <th>Selection Status</th>
            </tr>
          </thead>
          <tbody>
            {selections.map((item) => (
              <tr key={item.category}>
                <td>{item.category}</td>
                <td>{item.vendor || '—'}</td>
                <td>
                  <StatusBadge tone={bookingStatusTone(item.status)}>{item.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="clients-cards booking-selections__cards">
        {selections.map((item) => (
          <li key={item.category} className="clients-card">
            <div className="clients-card__top">
              <strong>{item.category}</strong>
              <StatusBadge tone={bookingStatusTone(item.status)}>{item.status}</StatusBadge>
            </div>
            <p>{item.vendor || '—'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BookingVendorSelections;
