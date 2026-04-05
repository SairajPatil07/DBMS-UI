import { useState, useEffect } from 'react';
import { Users, UserX, UserCheck, IndianRupee, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getNotifications } from '../services';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, expiringSoon: 0, monthlyRevenue: 0, revenueTrend: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, notifData] = await Promise.all([
          getDashboardStats(),
          getNotifications(),
        ]);
        setStats(dashData);
        setNotifications(notifData);
      } catch (err) {
        setError('⚠️ Could not connect to database. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = stats.revenueTrend?.map(r => ({
    name: r.MONTH_LABEL || r.month_label,
    revenue: r.REVENUE || r.revenue,
  })) || [];

  const statCards = [
    { title: 'Total Members',   value: stats.totalMembers,              icon: <Users size={24} />,      color: 'var(--text-primary)' },
    { title: 'Active Members',  value: stats.activeMembers,             icon: <UserCheck size={24} />,  color: 'var(--status-active)' },
    { title: 'Expiring Soon',   value: stats.expiringSoon,              icon: <UserX size={24} />,      color: 'var(--status-warning)' },
    { title: 'Monthly Revenue', value: `₹${stats.monthlyRevenue || 0}`, icon: <IndianRupee size={24}/>, color: 'var(--accent-primary)' },
  ];

  if (loading) return <div className="loading-state">Connecting to Oracle DB...</div>;

  return (
    <div className="dashboard">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Live data from Oracle DB — Members, Payments &amp; Plans aggregated
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in">
        {statCards.map((stat, idx) => (
          <div className="stat-card card" key={idx}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Notifications */}
      <div className="charts-section animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="chart-container card">
          <h3 style={{ marginBottom: '20px' }}>Monthly Revenue (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false}/>
                  <XAxis dataKey="name" stroke="var(--text-secondary)"/>
                  <YAxis stroke="var(--text-secondary)"/>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorRevenue)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-secondary text-center py-6">No revenue data yet. Add payments to see the chart.</p>
          )}
        </div>

        {/* Notifications Panel */}
        <div className="side-panel card">
          <h3 className="flex-center gap-2 mb-4">
            <Bell size={20} color="var(--accent-primary)"/> Live Notifications
          </h3>
          {notifications.length === 0 ? (
            <p className="text-secondary">No alerts right now 🎉</p>
          ) : (
            <div className="activity-list">
              {notifications.map((n, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-dot ${n.type}`}></div>
                  <div>
                    <p style={{ fontSize: '0.9rem' }}>{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
