import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Dashboard.css';

/* ── Helper: parse ₹ formatted amount to number ── */
function parseAmount(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[₹,\s]/g, '')) || 0;
}

/* ── Static payment display data (demo) ─────────── */
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
    { name: 'Kishan Bros.', sub: 'Bracelet batch – Invoice #1030', amount: '+₹11,500', date: 'PAID' },
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

const DASHBOARD_ORDERS = [
  { id: 'RI_2001', customer: 'Mahesh Patel', product: 'Gold Chain', qty: 50, due: 'Feb 28', progress: 75, status: 'GOLD PLATING', statusColor: '#f4a12a' },
  { id: 'RI_2002', customer: 'Ramesh Jewellers', product: 'Ring Set', qty: 30, due: 'Mar 2', progress: 50, status: 'FINISHING', statusColor: '#3e97b9' },
  { id: 'RI_2003', customer: 'Vijay Exports', product: 'Necklace', qty: 20, due: 'Mar 5', progress: 25, status: 'CASTING', statusColor: '#f4a12a' },
  { id: 'RI_2004', customer: 'Anita Stores', product: 'Earrings', qty: 100, due: 'Mar 7', progress: 100, status: 'READY', statusColor: '#2dab6f' },
];

/* ── Sub-components ─────────────────────────────── */
function PayRow({ item, variant, g }) {
  const isOverdue = variant === 'overdue';
  const isToday = variant === 'today';
  const isPaid = item.date === 'PAID';

  return (
    <div className={`pay-row ${isOverdue ? 'pay-overdue' : ''} ${isToday ? 'pay-today' : ''}`}>
      <div className="pay-row-left">
        <div className="pay-name">{item.name}</div>
        <div className="pay-sub">{g(item.sub)}</div>
      </div>
      <div className="pay-row-right">
        <div className={`pay-amount ${item.amount.startsWith('+') ? 'green' : 'red'}`}>{g(item.amount)}</div>
        <div className={`pay-date ${isOverdue ? 'overdue-tag' : ''} ${isToday ? 'today-tag' : ''} ${isPaid ? 'paid-tag' : ''}`}>
          {g(item.date)}
        </div>
      </div>
    </div>
  );
}

function PaySection({ title, icon, data, t, g }) {
  const hasOverdue = data.overdue.length > 0;
  const hasToday = data.today.length > 0;
  const hasUpcoming = data.upcoming.length > 0;

  return (
    <div className="pay-panel">
      <div className="pay-panel-header">
        <span className={`pay-dot ${title.includes('Receive') || title.includes('મળવા') ? 'green' : 'red'}`}></span>
        <span className="pay-panel-title">{title}</span>
      </div>

      {hasOverdue && (
        <>
          <div className="pay-group-label">{t.overdue}</div>
          {data.overdue.map((r, i) => <PayRow key={i} item={r} variant="overdue" g={g} />)}
        </>
      )}
      {hasToday && (
        <>
          <div className="pay-group-label">{g('TODAY – FEB 25')}</div>
          {data.today.map((r, i) => <PayRow key={i} item={r} variant="today" g={g} />)}
        </>
      )}
      {hasUpcoming && (
        <>
          <div className="pay-group-label">{t.upcoming}</div>
          {data.upcoming.map((r, i) => <PayRow key={i} item={r} variant="upcoming" g={g} />)}
        </>
      )}
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────── */
export default function Dashboard({ orders = [], history = [], products = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, g } = useLanguage();

  const formatINR = (n) => g(`₹${Math.abs(n).toLocaleString('en-IN')}`);

  if (user?.role === 'Employee') {
    const lowStockProducts = products.filter(p => p.lowStock);
    const todaysTx = history.slice(0, 5); 
    const todaysSales = history.filter(h => h.type === 'Sell').slice(0, 5);
    const salesSum = todaysSales.reduce((sum, h) => sum + parseAmount(h.amount), 0);

    const EMP_STATS = [
      { label: t.todaysSales, value: formatINR(salesSum), color: '#2dab6f', sub: `${g(todaysSales.length)} ${t.itemsSold}`, path: '/employee/transactions?tab=history' },
      { label: t.lowStockItems, value: g(String(lowStockProducts.length)), color: '#e05c5c', sub: t.needsRestock, path: '/employee/inventory' },
      { label: t.recentTransactions, value: g(String(todaysTx.length)), color: '#3e97b9', sub: t.latestActivity, path: '/employee/transactions?tab=history' },
    ];

    return (
      <div className="dash">
        <div className="stat-row">
          {EMP_STATS.map(s => (
            <div className="stat-card" key={s.label} style={{ borderLeftColor: s.color, cursor: 'pointer' }} onClick={() => navigate(s.path)}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
        
        <div className="orders-panel" style={{ marginTop: '20px' }}>
           <div className="orders-panel-header"><span className="orders-title">{t.lowStockAlerts}</span></div>
           <table className="orders-table">
             <thead><tr><th>{t.productId}</th><th>{t.productName}</th><th>{t.stockLevel}</th></tr></thead>
             <tbody>
               {lowStockProducts.length === 0 ? <tr><td colSpan="3">{t.noLowStock}</td></tr> : lowStockProducts.map(p => (
                 <tr key={p.id}><td className="order-id">{g(p.id)}</td><td>{p.name}</td><td style={{color: '#e05c5c', fontWeight: 'bold'}}>{g(p.stock)} {t.units}</td></tr>
               ))}
             </tbody>
           </table>
        </div>

        <div className="orders-panel" style={{ marginTop: '20px' }}>
           <div className="orders-panel-header"><span className="orders-title">{t.todaysTransactions}</span></div>
           <table className="orders-table">
             <thead><tr><th>{t.txId}</th><th>{t.type}</th><th>{t.party}</th><th>{t.amount}</th><th>{t.status}</th></tr></thead>
             <tbody>
               {todaysTx.length === 0 ? <tr><td colSpan="5">{t.noTransactionsToday}</td></tr> : todaysTx.map(tx => (
                 <tr key={tx.id}><td className="order-id">{g(tx.id)}</td><td><span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: tx.type === 'Sell' ? '#e6f8f0' : '#fff8ee', color: tx.type === 'Sell' ? '#2dab6f' : '#f4a12a' }}>{tx.type === 'Sell' ? t.sell.replace(' →','') : t.buy}</span></td><td>{tx.party}</td><td>{g(tx.amount)}</td><td>{tx.status}</td></tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    );
  }

  // ── Dynamic calculations from live data ──
  const totalReceivable = history
    .filter(h => h.type === 'Sell' && h.status === 'Received')
    .reduce((sum, h) => sum + parseAmount(h.amount), 0);

  const totalPayable = history
    .filter(h => h.type === 'Buy' && h.status === 'Pending')
    .reduce((sum, h) => sum + parseAmount(h.amount), 0);

  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const netBalance = totalReceivable - totalPayable;

  const STATS = [
    {
      label: t.toReceive,
      value: formatINR(totalReceivable),
      color: '#2dab6f',
      sub: `${g(history.filter(h => h.type === 'Sell' && h.status === 'Received').length)} ${t.receivedPayments}`,
      path: '/transactions?tab=history'
    },
    {
      label: t.toPay,
      value: formatINR(totalPayable),
      color: '#e05c5c',
      sub: `${g(history.filter(h => h.type === 'Buy' && h.status === 'Pending').length)} ${t.pendingPayments}`,
      path: '/transactions?tab=history'
    },
    {
      label: t.pendingOrders,
      value: g(String(pendingOrdersCount)),
      color: '#f4a12a',
      sub: `${g(deliveredCount)} ${t.delivered}`,
      path: '/orders'
    },
    {
      label: t.netBalance,
      value: `${netBalance >= 0 ? '' : '−'}${formatINR(netBalance)}`,
      color: netBalance >= 0 ? '#3e97b9' : '#e05c5c',
      sub: t.receivableMinusPayable,
      path: '/transactions?tab=history'
    },
  ];

  return (
    <div className="dash">
      <div className="stat-row">
        {STATS.map(s => (
          <div className="stat-card" key={s.label} style={{ borderLeftColor: s.color, cursor: 'pointer' }} onClick={() => navigate(s.path)}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="pay-grid">
        <PaySection title={t.paymentsToReceive} icon="" data={RECEIVE} t={t} g={g} />
        <PaySection title={t.paymentsToMake} icon="" data={PAY} t={t} g={g} />
      </div>

      <div className="orders-panel">
        <div className="orders-panel-header">
          <span className="orders-title">{t.pendingOrdersProduction}</span>
          <a href="/orders" className="view-all-link">{t.viewAllOrders}</a>
        </div>

        <table className="orders-table">
          <thead>
            <tr>
              <th>{t.orderId}</th>
              <th>{t.customer}</th>
              <th>{t.product}</th>
              <th>{t.qty}</th>
              <th>{t.dueDate}</th>
              <th>{t.progress}</th>
              <th>{t.status}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {DASHBOARD_ORDERS.map(o => (
              <tr key={o.id}>
                <td className="order-id">{g(o.id)}</td>
                <td className="order-customer">{o.customer}</td>
                <td>{o.product}</td>
                <td>{g(o.qty)}</td>
                <td className={o.due.includes('Feb') ? 'due-soon' : ''}>{g(o.due)}</td>
                <td>
                  <div className="progress-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${o.progress}%` }} />
                    </div>
                    <span className="progress-pct">{g(o.progress)}%</span>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ color: o.statusColor, borderColor: o.statusColor }}>
                    {o.status}
                  </span>
                </td>
                <td><a href="/orders" className="sell-link">{t.sell}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
