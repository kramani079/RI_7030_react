import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
    return (
        <div className="about-page">
            <section className="about-hero">
                <h1 className="about-title">About RI Inventory</h1>
                <p className="about-subtitle">
                    A comprehensive inventory management system for jewellery manufacturing.
                </p>
            </section>

            <section className="about-content">
                <div className="about-card">
                    <h2>🏭 Our System</h2>
                    <p>
                        <strong>RI (Rameshwar Imitation)</strong> is an inventory management platform designed
                        to streamline product tracking, order processing, employee management, and transaction
                        recording for jewellery manufacturing businesses.
                    </p>
                </div>

                <div className="about-card">
                    <h2>🔧 Technology Stack</h2>
                    <ul className="about-tech-list">
                        <li><strong>React.js</strong> — Functional components with hooks</li>
                        <li><strong>React Router DOM v6</strong> — Client-side routing</li>
                        <li><strong>Context API</strong> — Authentication state management</li>
                        <li><strong>JSON Server</strong> — Mock REST API backend</li>
                        <li><strong>Vanilla CSS</strong> — Custom responsive design</li>
                    </ul>
                </div>

                <div className="about-card">
                    <h2>👥 Roles</h2>
                    <div className="about-roles-grid">
                        <div className="about-role-box">
                            <h3>🔐 Admin</h3>
                            <p>Full access to dashboard, inventory, orders, employees, transactions, and profile management.</p>
                        </div>
                        <div className="about-role-box">
                            <h3>👤 Employee</h3>
                            <p>View products, create sales transactions, view low-stock items, submit stock requests, and manage profile.</p>
                        </div>
                    </div>
                </div>

                <div className="about-card">
                    <h2>🛣️ React Router Concepts Used</h2>
                    <ul className="about-tech-list">
                        <li><code>BrowserRouter</code> — Client-side routing wrapper</li>
                        <li><code>Routes / Route</code> — Declarative route definitions</li>
                        <li><code>Link / NavLink</code> — Navigation without page reloads</li>
                        <li><code>useNavigate</code> — Programmatic navigation</li>
                        <li><code>useParams</code> — Dynamic route parameters</li>
                        <li><code>Outlet</code> — Nested route rendering</li>
                        <li><code>Navigate</code> — Protected route redirects</li>
                    </ul>
                </div>
            </section>

            <div className="about-footer">
                <Link to="/" className="about-back-link">← Back to Home</Link>
            </div>
        </div>
    );
}
