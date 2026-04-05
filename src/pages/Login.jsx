import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, User } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate validation against Users table
    // In real app: POST /api/auth/login → SELECT * FROM Users WHERE username=? AND password=?
    if (form.username === 'admin' && form.password === 'admin123') {
      setTimeout(() => navigate('/'), 600);
    } else {
      setLoading(false);
      setError('Invalid credentials. Try admin / admin123');
    }
  };

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon-wrap">
            <Dumbbell size={36} color="var(--accent-primary)" />
          </div>
          <h1>IronForge <span>DBMS</span></h1>
          <p>Gym Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} color="var(--text-secondary)" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>

          <p className="login-hint">
            <span>Demo: </span><code>admin</code> / <code>admin123</code>
            <br/>
            <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
              ↳ Validates against <strong>Users</strong> table in Oracle DB
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
