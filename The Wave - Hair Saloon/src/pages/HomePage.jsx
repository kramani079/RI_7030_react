import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const { members, sales, inventory, appointments } = useData();
  const navigate = useNavigate();

  /* ── stats ──────────────────────────────────────── */
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  const now = new Date();
  const activeMembers = members.filter(m => {
    const end = new Date(m.startDate);
    end.setMonth(end.getMonth() + m.months);
    return end >= now;
  });

  const lowStockItems = inventory.filter(i => i.qty <= i.lowStock);

  const stats = [
    { label: 'Total Members',    value: members.length,          icon: '👥', color: 'gold',   route: '/membership' },
    { label: 'Active Members',   value: activeMembers.length,    icon: '✅', color: 'green',  route: '/membership' },
    { label: "Today's Sales",    value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: '💰', color: 'blue', route: '/sales' },
    { label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '📈', color: 'purple', route: '/sales' },
    { label: 'Sales Today',      value: todaySales.length,       icon: '🛒', color: 'orange', route: '/sales' },
    { label: 'Low Stock Items',  value: lowStockItems.length,    icon: '⚠️', color: 'red',    route: '/inventory' },
  ];

  /* ── recent sales ───────────────────────────────── */
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  /* ── upcoming appointments ──────────────────────── */
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments
    .filter(a => a.status === 'Scheduled' && a.date >= todayStr)
    .sort((a, b) => {
      if (a.date === b.date) {
        return a.startTime.localeCompare(b.startTime);
      }
      return a.date.localeCompare(b.date);
    })
    .slice(0, 5);

  const services = [
    { icon: '✂️',  name: 'Hair Cut'     },
    { icon: '🪒',  name: 'Beard Cut'    },
    { icon: '💆',  name: 'Facial'       },
    { icon: '✨',  name: 'Detan'        },
    { icon: '🧴',  name: 'Clean Up'     },
    { icon: '💅',  name: 'Hair Massage' },
    { icon: '🚿',  name: 'Hair Wash'    },
    { icon: '🎨',  name: 'Hair Color'   },
    { icon: '🌈',  name: 'Highlights'   },
    { icon: '🛁',  name: 'Hair Spa'     },
    { icon: '💅',  name: 'Manicure'     },
    { icon: '🦶',  name: 'Pedicure'     },
  ];

  return (
    <div className="home-page animate-fade-in">
      {/* ── Hero ─────────────────────────────────── */}
      <div className="home-hero">
        <div className="hero-text">
          <h1 className="hero-title">The Wave</h1>
          <p className="hero-subtitle">Men's Saloon — Premium Grooming Experience</p>
          <p className="hero-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={() => navigate('/sales')}>
            💰 New Sale
          </button>
          <button className="hero-btn-secondary" onClick={() => navigate('/membership')}>
            👤 Membership
          </button>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────── */}
      <div className="home-stats">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`stat-card stat-card--${s.color}`}
            onClick={() => navigate(s.route)}
            title={`Go to ${s.label}`}
          >
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Services & Recent Sales ──────────────── */}
      <div className="home-grid">
        {/* Services offered */}
        <div className="home-card">
          <h2 className="card-title">✂️ Our Services</h2>
          <div className="services-grid">
            {services.map((sv, i) => (
              <div key={i} className="service-chip">
                <span className="service-chip-icon">{sv.icon}</span>
                <span className="service-chip-name">{sv.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sales */}
        <div className="home-card">
          <div className="card-header">
            <h2 className="card-title">🛒 Recent Sales</h2>
            <button className="card-link" onClick={() => navigate('/sales')}>View all →</button>
          </div>
          <div className="recent-sales-list">
            {recentSales.length === 0 && (
              <p className="empty-text">No sales yet. <span onClick={() => navigate('/sales')} style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>Add one →</span></p>
            )}
            {recentSales.map(sale => (
              <div key={sale.id} className="recent-sale-item">
                <div className="rsi-left">
                  <div className="rsi-customer">{sale.customer || 'Walk-in'}</div>
                  <div className="rsi-items">{sale.items.map(i => i.name).join(', ')}</div>
                </div>
                <div className="rsi-right">
                  <div className="rsi-amount">₹{sale.total.toLocaleString('en-IN')}</div>
                  <div className="rsi-date">{new Date(sale.date).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="home-card appointments-card">
          <div className="card-header">
            <h2 className="card-title">📅 Upcoming Appointments</h2>
            <button className="card-link" onClick={() => navigate('/appointments')}>View all →</button>
          </div>
          <div className="recent-sales-list">
             {upcomingAppointments.length === 0 && (
              <p className="empty-text">No upcoming appointments. <span onClick={() => navigate('/appointments')} style={{ color: 'var(--accent-gold)', cursor: 'pointer' }}>Schedule one →</span></p>
            )}
            {upcomingAppointments.map(appt => {
              const apptDate = appt.date === todayStr ? 'Today' : new Date(appt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
              return (
                <div key={appt.id} className="recent-sale-item" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
                  <div className="rsi-left">
                    <div className="rsi-customer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {appt.customerName}
                      <span className="badge badge-blue" style={{ fontSize: '9px', padding: '2px 6px' }}>{appt.employee}</span>
                    </div>
                    <div className="rsi-items" style={{ color: 'var(--accent-gold)' }}>{appt.services}</div>
                    <div className="rsi-items" style={{ fontSize: '10px' }}>📞 {appt.phone}</div>
                  </div>
                  <div className="rsi-right" style={{ textAlign: 'right' }}>
                    <div className="rsi-amount" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {appt.startTime} - {appt.endTime}
                    </div>
                    <div className="rsi-date" style={{ fontWeight: 600, color: apptDate === 'Today' ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {apptDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Low Stock Warning ────────────────────── */}
      {lowStockItems.length > 0 && (
        <div className="home-card low-stock-card" onClick={() => navigate('/inventory')}>
          <h2 className="card-title" style={{ color: 'var(--accent-red)' }}>⚠️ Low Stock Alert</h2>
          <div className="low-stock-list">
            {lowStockItems.map(item => (
              <div key={item.id} className="low-stock-item">
                <span>{item.name}</span>
                <span className="badge badge-red">{item.qty} {item.unit} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
