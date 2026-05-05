import { useParams, Link } from 'react-router-dom';
import './UserDetail.css';

// Demo user data
const DEMO_USERS = {
    '1': { name: 'Mahesh Patel', email: 'mahesh@gmail.com', role: 'Admin', department: 'Management' },
    '2': { name: 'Nikhil Sharma', email: 'nikhil@ri-factory.com', role: 'Employee', department: 'Gold Plating' },
    '3': { name: 'Ramesh Jewellers', email: 'ramesh@jewellers.com', role: 'Employee', department: 'Casting' },
};

export default function UserDetail() {
    const { id } = useParams();
    const user = DEMO_USERS[id];

    return (
        <div className="userdetail-page">
            <div className="userdetail-card">
                <Link to="/" className="userdetail-back">← Back to Home</Link>

                <h1 className="userdetail-title">User Detail</h1>
                <p className="userdetail-subtitle">
                    Dynamic route using <code>useParams()</code> — ID: <strong>{id}</strong>
                </p>

                {user ? (
                    <div className="userdetail-info">
                        <div className="userdetail-avatar">
                            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="userdetail-grid">
                            <div className="userdetail-field">
                                <label>Name</label>
                                <p>{user.name}</p>
                            </div>
                            <div className="userdetail-field">
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>
                            <div className="userdetail-field">
                                <label>Role</label>
                                <p>{user.role}</p>
                            </div>
                            <div className="userdetail-field">
                                <label>Department</label>
                                <p>{user.department}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="userdetail-not-found">
                        <span>🔍</span>
                        <p>No user found with ID: <strong>{id}</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
}
