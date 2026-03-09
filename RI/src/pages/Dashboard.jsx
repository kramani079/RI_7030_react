import './Dashboard.css';

/* ── Static demo data mirroring the .NET reference ── */
const STATS = [
  {
    label: 'TO RECEIVE (RECEIVABLE)',
    value: '₹1,85,000',
    color: '#2dab6f',
    sub: '6 pending payments →',
  },
  {
    label: 'TO PAY (PAYABLE)',
    value: '₹72,500',
    color: '#e05c5c',
    sub: '4 pending payments →',
  },
  {
    label: 'PENDING ORDERS',
    value: '8',
    color: '#f4a12a',
    sub: '3 due this week →',
  },
  {
    label: 'NET BALANCE',
    value: '₹1,12,500',
    color: '#3e97b9',
    sub: 'Receivable − Payable →',
  },
];

const RECEIVE = {
  overdue: [
    { name: 'Mahesh Patel', sub: 'Gold chain order – Invoice #1021', amount: '+₹50,000', date: 'OVERDUE – FEB 20' },
    { name: 'Suresh Traders', sub: 'Bangles batch – Invoice #1018', amount: '+₹28,000', date: 'OVERDUE – FEB 22' },
  ],
  today: [
    { name: 'Ramesh Jewellers', sub: 'Ring set – Invoice #1025', amount: '+₹35,000', date: 'DUE TODAY' },
  ],
  upcoming: [
    { name: 'Vijay Exports', sub: 'Necklace order – Invoice #1027', amount: '+₹42,000', date: 'FEB 27' },
    { name: 'Anita Stores', sub: 'Earrings bulk – Invoice #1028', amount: '+₹18,500', date: 'MAR 1' },
    { name: 'Kishan Bros.', sub: 'Bracelet batch – Invoice #1030', amount: '+₹11,500', date: 'PAID ✔' },
  ],
};

const PAY = {
  overdue: [
    { name: 'Nikhil Supplier', sub: 'Raw gold material – Bill #B-204', amount: '−₹22,500', date: 'OVERDUE – FEB 21' },
  ],
  today: [
    { name: 'Rajan Chemicals', sub: 'Plating chemicals – Bill #B-209', amount: '−₹10,000', date: 'DUE TODAY' },
  ],
  upcoming: [
    { name: 'Praveen Metals', sub: 'Silver wire stock – Bill #B-212', amount: '−₹25,000', date: 'FEB 28' },
    { name: 'Logistics Co.', sub: 'Freight charges – Bill #B-215', amount: '−₹15,000', date: 'MAR 3' },
  ],
};

const ORDERS = [
  { id: 'RI_2001', customer: 'Mahesh Patel', product: 'Gold Chain', qty: 50, due: 'Feb 28', progress: 75, status: 'GOLD PLATING', statusColor: '#f4a12a' },
  { id: 'RI_2002', customer: 'Ramesh Jewellers', product: 'Ring Set', qty: 30, due: 'Mar 2', progress: 50, status: 'FINISHING', statusColor: '#3e97b9' },
  { id: 'RI_2003', customer: 'Vijay Exports', product: 'Necklace', qty: 20, due: 'Mar 5', progress: 25, status: 'CASTING', statusColor: '#f4a12a' },
  { id: 'RI_2004', customer: 'Anita Stores', product: 'Earrings', qty: 100, due: 'Mar 7', progress: 100, status: 'READY ✔', statusColor: '#2dab6f' },
];

/* ── Sub-components ─────────────────────────────── */
function PayRow({ item, variant }) {
  const isOverdue = variant === 'overdue';
  const isToday = variant === 'today';
  const isPaid = item.date === 'PAID ✔';

  return (
    <div className={`pay-row ${isOverdue ? 'pay-overdue' : ''} ${isToday ? 'pay-today' : ''}`}>
      <div className="pay-row-left">
        <div className="pay-name">{item.name}</div>
        <div className="pay-sub">{item.sub}</div>
      </div>
      <div className="pay-row-right">
        <div className={`pay-amount ${item.amount.startsWith('+') ? 'green' : 'red'}`}>{item.amount}</div>
        <div className={`pay-date ${isOverdue ? 'overdue-tag' : ''} ${isToday ? 'today-tag' : ''} ${isPaid ? 'paid-tag' : ''}`}>
          {item.date}
        </div>
      </div>
    </div>
  );
}

function PaySection({ title, icon, data }) {
  const hasOverdue = data.overdue.length > 0;
  const hasToday = data.today.length > 0;
  const hasUpcoming = data.upcoming.length > 0;

  return (
    <div className="pay-panel">
      <div className="pay-panel-header">
        <span className={`pay-dot ${title.includes('Receive') ? 'green' : 'red'}`}></span>
        <span className="pay-panel-icon">{icon}</span>
        <span className="pay-panel-title">{title}</span>
      </div>

      {hasOverdue && (
        <>
          <div className="pay-group-label">⚠ OVERDUE</div>
          {data.overdue.map((r, i) => <PayRow key={i} item={r} variant="overdue" />)}
        </>
      )}
      {hasToday && (
        <>
          <div className="pay-group-label">📅 TODAY – FEB 25</div>
          {data.today.map((r, i) => <PayRow key={i} item={r} variant="today" />)}
        </>
      )}
      {hasUpcoming && (
        <>
          <div className="pay-group-label">📅 UPCOMING</div>
          {data.upcoming.map((r, i) => <PayRow key={i} item={r} variant="upcoming" />)}
        </>
      )}
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────── */
export default function Dashboard() {
  return (
    <div className="dash">

      {/* ── Stat Cards ─────────────────────── */}
      <div className="stat-row">
        {STATS.map(s => (
          <div className="stat-card" key={s.label} style={{ borderLeftColor: s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Payments two-column ─────────────── */}
      <div className="pay-grid">
        <PaySection title="Payments to Receive" icon="🌿" data={RECEIVE} />
        <PaySection title="Payments to Make" icon="💎" data={PAY} />
      </div>

      {/* ── Pending Orders Table ─────────────── */}
      <div className="orders-panel">
        <div className="orders-panel-header">
          <span className="orders-title">🍊 Pending Orders – Production Status</span>
          <a href="/orders" className="view-all-link">View All Orders →</a>
        </div>

        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Due Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map(o => (
              <tr key={o.id}>
                <td className="order-id">{o.id}</td>
                <td className="order-customer">{o.customer}</td>
                <td>{o.product}</td>
                <td>{o.qty}</td>
                <td className={o.due.includes('Feb') ? 'due-soon' : ''}>{o.due}</td>
                <td>
                  <div className="progress-wrap">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${o.progress}%` }}
                      />
                    </div>
                    <span className="progress-pct">{o.progress}%</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ color: o.statusColor, borderColor: o.statusColor }}>
                    {o.status}
                  </span>
                </td>
                <td><a href="/orders" className="sell-link">Sell →</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
