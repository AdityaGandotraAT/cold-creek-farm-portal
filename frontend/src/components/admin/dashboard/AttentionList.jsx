import { Icon } from '../AdminIcons.jsx';
import StatusBadge from './StatusBadge.jsx';

function AttentionList({ items }) {
  return (
    <section className="dashboard-panel" aria-labelledby="attention-heading">
      <div className="dashboard-panel__header">
        <div>
          <h2 id="attention-heading">Needs Attention</h2>
          <p>{items.length} follow-up items for the Cold Creek Farm team.</p>
        </div>
      </div>

      <ul className="dashboard-attention">
        {items.map((item) => (
          <li
            key={item.id}
            className={`dashboard-attention__item dashboard-attention__item--${item.severity}`}
          >
            <span className="dashboard-attention__icon" aria-hidden="true">
              <Icon name="alert" />
            </span>
            <div>
              <div className="dashboard-attention__title-row">
                <strong>{item.title}</strong>
                <StatusBadge tone={item.severity === 'high' ? 'unavailable' : 'pending'}>
                  {item.severity === 'high' ? 'Needs action' : 'Follow up'}
                </StatusBadge>
              </div>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AttentionList;
