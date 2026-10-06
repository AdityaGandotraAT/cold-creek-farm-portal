import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/admin/clients/StatusBadge.jsx';
import '../../components/admin/clients/clients.css';
import { bookingStatusTone, formatEventDate } from '../../components/admin/dashboard/format.js';
import { fetchMyVendorSelections, saveMyVendorSelection } from '../../api/clientPortal.js';
import { REQUIRED_VENDOR_CATEGORIES, vendorCategories as requiredCategories } from '../../data/bookingsMock.js';
import { vendorCategories as preferredCategories } from '../../data/vendorsMock.js';
import { getVendorSelectionLockDays } from '../../data/vendorSelectionLock.js';

function vendorsForCategory(vendors, category) {
  return vendors.filter((vendor) => vendor.category === category && vendor.status === 'Active');
}

function remainingLabel(lock) {
  if (!lock || lock.status === 'Unknown' || lock.daysUntilDeadline == null) {
    return 'Event date is missing.';
  }
  if (!lock.locked) {
    return lock.daysUntilDeadline === 1
      ? '1 day remaining to make changes'
      : `${lock.daysUntilDeadline} days remaining to make changes`;
  }
  return `Selections locked ${getVendorSelectionLockDays()} days before the event.`;
}

function ClientVendorsPage() {
  const [booking, setBooking] = useState(null);
  const [selections, setSelections] = useState([]);
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingCategory, setSavingCategory] = useState('');
  const [catalogVendors, setCatalogVendors] = useState([]);

  const catalog = useMemo(() => {
    const map = {};
    const extraCategories = catalogVendors
      .map((vendor) => vendor.category)
      .filter((category) => category && !preferredCategories.includes(category));
    const categories = [...preferredCategories, ...extraCategories];

    for (const category of categories) {
      map[category] = vendorsForCategory(catalogVendors, category);
    }
    return map;
  }, [catalogVendors]);

  const catalogCategories = Object.keys(catalog).filter(
    (category) => (catalog[category] || []).length > 0,
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMyVendorSelections();
        if (active) {
          setBooking(data.booking || null);
          setSelections(data.selections || []);
          setLock(data.lock || null);
          setCatalogVendors(data.vendors || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load vendor selections');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedCount = selections.filter(
    (item) => item.vendor && (item.status === 'Pending' || item.status === 'Confirmed'),
  ).length;
  const locked = Boolean(lock?.locked);

  async function handleSelect(category, vendorName) {
    if (locked || savingCategory) {
      return;
    }

    const options = catalog[category] || [];
    const vendor = options.find((item) => item.name === vendorName) || null;

    setSavingCategory(category);
    setNotice('');
    setError('');

    try {
      const data = await saveMyVendorSelection({
        category,
        vendorName: vendor?.name || '',
        vendorEmail: vendor?.email || '',
      });
      setBooking(data.booking || booking);
      setSelections(data.selections || []);
      setLock(data.lock || lock);
      if (data.vendors) {
        setCatalogVendors(data.vendors);
      }
      setNotice(
        vendor
          ? `${vendor.name} saved for ${category}. They will confirm availability by email.`
          : `${category} selection cleared.`,
      );
    } catch (err) {
      setError(err.message || 'Unable to save vendor selection');
    } finally {
      setSavingCategory('');
    }
  }

  if (loading) {
    return (
      <div className="client-booking">
        <header className="client-booking__intro">
          <div>
            <p className="client-stub__kicker">Your vendors</p>
            <h2>Vendor Selections</h2>
            <p>Loading preferred vendors for your event...</p>
          </div>
        </header>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="client-booking">
        <header className="client-booking__intro">
          <div>
            <p className="client-stub__kicker">Your vendors</p>
            <h2>No booking yet</h2>
            <p>
              Vendor picks open after Cold Creek Farm assigns your event. You can still review
              your account while you wait.
            </p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="client-booking">
      <header className="client-booking__intro">
        <div>
          <p className="client-stub__kicker">Your vendors</p>
          <h2>Vendor Selections</h2>
          <p>
            Choose preferred Cold Creek Farm vendors for {booking.eventName}. The six required
            categories must be filled; you can also pick from the rest of the preferred list.
          </p>
        </div>
        <StatusBadge tone={lock?.status === 'Open' ? 'confirmed' : 'pending'}>
          {lock?.status || 'Unknown'}
        </StatusBadge>
      </header>

      {error ? (
        <p className="client-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? <p className="client-vendors__notice">{notice}</p> : null}

      <section className="client-welcome__grid" aria-label="Selection progress">
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Progress</p>
          <p className="client-welcome__card-value">
            {selectedCount} of {REQUIRED_VENDOR_CATEGORIES}
          </p>
          <p className="client-welcome__card-hint">Required categories</p>
        </article>
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Event</p>
          <p className="client-welcome__card-value">{formatEventDate(booking.eventDate)}</p>
          <p className="client-welcome__card-hint">{booking.venue}</p>
        </article>
        <article className="client-welcome__card">
          <p className="client-welcome__card-label">Deadline</p>
          <p className="client-welcome__card-value">
            {lock?.deadlineDate ? formatEventDate(lock.deadlineDate) : '—'}
          </p>
          <p className="client-welcome__card-hint">{remainingLabel(lock)}</p>
        </article>
      </section>

      <p className={`client-vendors__lock${locked ? ' is-locked' : ''}`}>
        {locked
          ? 'Selections are locked. Contact Cold Creek Farm if a vendor needs to change.'
          : 'Pick a vendor in each category. The vendor is emailed Accept or Not available. If they cannot take the date, you will be asked to choose another vendor.'}
      </p>

      <div className="client-vendors__list">
        {catalogCategories.map((category) => {
          const item = selections.find((selection) => selection.category === category) || {
            category,
            vendor: null,
            status: 'Not Selected',
          };
          const options = catalog[category] || [];
          const selected = options.find((vendor) => vendor.name === item.vendor) || null;
          const busy = savingCategory === category;
          const required = requiredCategories.includes(category);

          return (
            <section
              key={category}
              className="client-booking__panel client-vendors__card"
              aria-labelledby={`vendor-category-${category}`}
            >
              <div className="client-vendors__card-head">
                <div>
                  <h3 id={`vendor-category-${category}`}>{category}</h3>
                  <p>{required ? 'Required category' : 'Additional preferred vendors'}</p>
                </div>
                <StatusBadge tone={bookingStatusTone(item.status)}>{item.status}</StatusBadge>
              </div>

              <label className="client-vendors__label" htmlFor={`vendor-select-${item.category}`}>
                Selected vendor
              </label>
              <select
                id={`vendor-select-${item.category}`}
                className="client-vendors__select"
                value={item.status === 'Unavailable' ? '' : item.vendor || ''}
                disabled={locked || Boolean(savingCategory)}
                onChange={(event) => handleSelect(item.category, event.target.value)}
              >
                <option value="">Choose a vendor</option>
                {options.map((vendor) => (
                  <option key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {busy ? <p className="client-vendors__saving">Saving...</p> : null}
              {item.status === 'Unavailable' ? (
                <p className="client-vendors__empty">
                  {item.vendor} is not available on this date. Please choose another vendor.
                </p>
              ) : null}

              {selected ? (
                <dl className="client-booking__facts client-vendors__facts">
                  <div>
                    <dt>Phone</dt>
                    <dd>{selected.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      {selected.email ? (
                        <a href={`mailto:${selected.email}`}>{selected.email}</a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Website</dt>
                    <dd>
                      {selected.website ? (
                        <a href={selected.website} target="_blank" rel="noreferrer">
                          {selected.website.replace(/^https?:\/\//i, '')}
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="client-vendors__empty">
                  {options.length
                    ? 'No vendor selected yet for this category.'
                    : 'No preferred vendors are listed in this category yet.'}
                </p>
              )}
            </section>
          );
        })}
      </div>

      <div className="client-welcome__strip">
        <p>
          <strong>Need the event details?</strong> Date, venue, and guest count stay on your
          booking page.
        </p>
        <Link className="client-welcome__cta" to="/client/booking">
          View my booking
        </Link>
      </div>
    </div>
  );
}

export default ClientVendorsPage;
