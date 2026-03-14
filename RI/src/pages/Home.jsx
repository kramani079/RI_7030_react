import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
    const { user } = useAuth();
    const dashLink = user
        ? user.role === 'Employee' ? '/employee/dashboard' : '/dashboard'
        : '/login';

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="home-hero">
                <div className="home-hero-content">
                    <span className="home-hero-badge">RI Inventory Management</span>
                    <h1 className="home-hero-title">
                        Manage your inventory
                        <span className="home-highlight"> effortlessly</span>
                    </h1>
                    <p className="home-hero-subtitle">
                        Track products, process transactions, manage stock levels, and generate reports — all from one powerful dashboard.
                    </p>
                    <div className="home-hero-actions">
                        <Link to={dashLink} className="home-btn home-btn-primary">
                            {user ? 'Go to Dashboard' : 'Get Started'}
                        </Link>
                        <Link to="/about" className="home-btn home-btn-secondary">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="home-features">
                <h2 className="home-features-title">Why choose RI?</h2>
                <div className="home-features-grid">
                    {[
                        { icon: '📦', title: 'Product Tracking', desc: 'Real-time stock levels with low-stock alerts and category management.' },
                        { icon: '💰', title: 'Transactions', desc: 'Record sales instantly with auto-calculated totals and inventory sync.' },
                        { icon: '📊', title: 'Dashboard Analytics', desc: 'At-a-glance metrics for products, orders, and revenue.' },
                        { icon: '👥', title: 'Role-Based Access', desc: 'Separate Admin and Employee panels with tailored permissions.' },
                        { icon: '📋', title: 'Stock Requests', desc: 'Employees can submit restocking requests for admin approval.' },
                        { icon: '🔒', title: 'Secure Auth', desc: 'Protected routes with role-based navigation and session management.' },
                    ].map((f, i) => (
                        <div className="home-feature-card" key={i}>
                            <span className="home-feature-icon">{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dynamic route demo */}
            <section className="home-users-demo">
                <h2 className="home-features-title">Dynamic Routes Demo</h2>
                <p className="home-users-subtitle">Click to view user detail pages using <code>useParams</code>:</p>
                <div className="home-users-grid">
                    {['1', '2', '3'].map(id => (
                        <Link to={`/users/${id}`} className="home-user-link" key={id}>
                            User #{id} →
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
