import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Activity, Dumbbell, ClipboardCheck, Bell, UserCircle, LogOut } from 'lucide-react';
import './MainLayout.css';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Members Context', path: '/members', icon: <Users size={20} /> },
    { name: 'Trainers', path: '/trainers', icon: <UserCircle size={20} /> },
    { name: 'Plans', path: '/plans', icon: <ClipboardCheck size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <Activity size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Equipment', path: '/equipment', icon: <Dumbbell size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <Dumbbell className="logo-icon" size={32} color="var(--accent-primary)" />
          <h1 className="logo-text">IronForge <span>DBMS</span></h1>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="search-bar">
            {/* Global Search Simulation */}
            <input type="text" placeholder="Search members, phone, plans..." />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <div className="profile-btn">
              <div className="avatar">A</div>
              <span>Admin Profile</span>
            </div>
            <button 
              className="icon-btn" 
              onClick={() => navigate('/login')} 
              title="Sign Out" 
              style={{ color: 'var(--accent-primary)', marginLeft: '8px' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="page-viewport glass">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
