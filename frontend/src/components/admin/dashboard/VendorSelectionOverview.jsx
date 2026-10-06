function VendorSelectionOverview({ categories }) {
  return (
    <section className="dashboard-panel" aria-labelledby="vendor-overview-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="vendor-overview-heading">Vendor Selection Overview</h2>
          <p>Required categories across bookings, plus any extra categories in use.</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="dashboard-empty">Vendor category totals will appear here after selections are in use.</p>
      ) : (
      <>
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
        {categories.map((row) => {
          const selected = Number(row.selected) || 0;
          const pending = Number(row.pending) || 0;
          const unavailable = Number(row.unavailable) || 0;
          const total = selected + pending + unavailable;

          return (
            <li key={row.category} className="dashboard-mix-row">
              <div className="dashboard-mix-row__top">
                <strong>{row.category}</strong>
                <span>
                  {selected} selected · {pending} pending · {unavailable} unavailable
                </span>
              </div>
              <div
                className={`dashboard-mix${total === 0 ? ' is-empty' : ''}`}
                style={{
                  '--selected': total ? selected : 1,
                  '--pending': total ? pending : 0,
                  '--unavailable': total ? unavailable : 0,
                }}
              >
                <span className="dashboard-mix__selected" />
                <span className="dashboard-mix__pending" />
                <span className="dashboard-mix__unavailable" />
              </div>
            </li>
          );
        })}
      </ul>
      </>
      )}
    </section>
  );
}

export default VendorSelectionOverview;
