function VendorSelectionOverview({ categories }) {
  return (
    <section className="dashboard-panel" aria-labelledby="vendor-overview-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="vendor-overview-heading">Vendor Selection Overview</h2>
          <p>Required categories across open bookings.</p>
        </div>
      </div>

      <ul className="dashboard-mix-legend" aria-hidden="true">
        <li>
          <span className="dashboard-dot dashboard-dot--selected" />
          Selected
        </li>
        <li>
          <span className="dashboard-dot dashboard-dot--pending" />
          Pending
        </li>
        <li>
          <span className="dashboard-dot dashboard-dot--unavailable" />
          Unavailable
        </li>
      </ul>

      <ul className="dashboard-mix-list">
        {categories.map((row) => (
          <li key={row.category} className="dashboard-mix-row">
            <div className="dashboard-mix-row__top">
              <strong>{row.category}</strong>
              <span>
                {row.selected} selected · {row.pending} pending · {row.unavailable} unavailable
              </span>
            </div>
            <div
              className="dashboard-mix"
              style={{
                '--selected': row.selected,
                '--pending': row.pending,
                '--unavailable': row.unavailable,
              }}
            >
              <span className="dashboard-mix__selected" />
              <span className="dashboard-mix__pending" />
              <span className="dashboard-mix__unavailable" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default VendorSelectionOverview;
