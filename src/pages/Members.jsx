import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Filter, Edit, Trash2, CreditCard, Activity, Calendar, X } from 'lucide-react';
import { getMembersList, getMemberProfile, deleteMember, addMember, getPlans, getTrainers } from '../services';
import './Members.css';

const Members = () => {
  const [members, setMembers]       = useState([]);
  const [plans, setPlans]           = useState([]);
  const [trainers, setTrainers]     = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading]       = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Add member form
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: 'Male', plan_id: '', trainer_id: '' });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const data = await getMembersList(searchTerm, filterStatus);
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [searchTerm, filterStatus]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    getPlans().then(d   => setPlans(Array.isArray(d) ? d : []));
    getTrainers().then(d => setTrainers(Array.isArray(d) ? d : []));
  }, []);

  const openProfile = async (id) => {
    setIsProfileOpen(true);
    setProfileLoading(true);
    const data = await getMemberProfile(id);
    setSelectedMember(data);
    setProfileLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete ${name}?\n\nWARNING: This will CASCADE delete their Payments and Attendance records (Foreign Key ON DELETE CASCADE).`)) {
      await deleteMember(id);
      setIsProfileOpen(false);
      fetchMembers();
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    await addMember(form);
    setIsAddOpen(false);
    setForm({ name: '', phone: '', email: '', gender: 'Male', plan_id: '', trainer_id: '' });
    fetchMembers();
  };

  // Normalize key access (Oracle returns UPPERCASE keys)
  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || obj[k.toLowerCase()] || '';

  return (
    <div className="members-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members Management</h1>
          <p className="text-secondary" style={{ marginTop: '6px' }}>Live JOIN from Members + Plans + Trainers tables</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={20}/> Add New Member
        </button>
      </div>

      {/* Controls */}
      <div className="members-controls card mb-6">
        <div className="search-box">
          <Search size={20} color="var(--text-secondary)"/>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={20} color="var(--text-secondary)"/>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container card">
        {loading ? (
          <p className="text-center text-secondary py-6">Loading from Oracle DB...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Member Name</th><th>Phone</th><th>Plan</th>
                <th>Trainer</th><th>Expiry</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={key(m,'member_id')} className="table-row">
                  <td>#{key(m,'member_id')}</td>
                  <td className="font-medium">
                    <div className="flex-center gap-2">
                      <div className="mini-avatar">{key(m,'name').charAt(0)}</div>
                      {key(m,'name')}
                    </div>
                  </td>
                  <td>{key(m,'phone')}</td>
                  <td><span className="badge-outline">{key(m,'plan_name') || 'None'}</span></td>
                  <td>{key(m,'trainer_name') || '—'}</td>
                  <td>{key(m,'expiry_date')?.toString().split('T')[0] || '—'}</td>
                  <td>
                    <span className={`status-badge status-${key(m,'status').replace(' ', '-').toLowerCase()}`}>
                      {key(m,'status')}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => openProfile(key(m,'member_id'))}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan="8" className="text-center py-6 text-secondary">No members found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsProfileOpen(false)}>
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Profile <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>— Multi-Table JOIN</span></h2>
              <button className="close-btn" onClick={() => setIsProfileOpen(false)}><X size={22}/></button>
            </div>

            {profileLoading ? (
              <p className="text-secondary text-center py-6">Fetching from Oracle DB...</p>
            ) : selectedMember && (
              <div className="profile-grid">
                {/* Members table data */}
                <div className="profile-card card">
                  <div className="profile-header-info">
                    <div className="large-avatar">{key(selectedMember,'name').charAt(0)}</div>
                    <div>
                      <h3>{key(selectedMember,'name')}</h3>
                      <p className="text-secondary">{key(selectedMember,'phone')}</p>
                      <span className={`status-badge mt-2 status-${key(selectedMember,'status').replace(' ', '-').toLowerCase()}`}>
                        {key(selectedMember,'status')}
                      </span>
                    </div>
                  </div>
                  <div className="profile-actions mt-4">
                    <button className="btn btn-secondary flex-1"><Edit size={16}/> Edit</button>
                    <button className="btn btn-danger flex-1"
                      onClick={() => handleDelete(key(selectedMember,'member_id'), key(selectedMember,'name'))}>
                      <Trash2 size={16}/> Delete (Cascade)
                    </button>
                  </div>
                </div>

                {/* Plans + Trainers JOIN */}
                <div className="join-data-card card">
                  <h4><Calendar size={18}/> Plan &amp; Trainer (JOIN)</h4>
                  <div className="data-row"><span>Plan:</span><strong>{key(selectedMember,'plan_name') || 'None'} (₹{key(selectedMember,'plan_price')})</strong></div>
                  <div className="data-row"><span>Duration:</span><strong>{key(selectedMember,'duration_months')} months</strong></div>
                  <div className="data-row"><span>Trainer:</span><strong>{key(selectedMember,'trainer_name') || 'Self-Guided'}</strong></div>
                  <div className="data-row"><span>Specialization:</span><strong>{key(selectedMember,'specialization') || '—'}</strong></div>
                  <div className="data-row"><span>Expiry:</span><strong>{key(selectedMember,'expiry_date')?.toString().split('T')[0]}</strong></div>
                </div>

                {/* Payments JOIN */}
                <div className="join-data-card card">
                  <h4><CreditCard size={18}/> Payment History (JOIN)</h4>
                  <div className="payment-list">
                    {(selectedMember.payments || selectedMember.PAYMENTS || []).map((p, i) => (
                      <div key={i} className="payment-item">
                        <span>{key(p,'payment_date')?.toString().split('T')[0]}</span>
                        <span className={`payment-status ${key(p,'status').toLowerCase()}`}>
                          ₹{key(p,'amount')} — {key(p,'status')}
                        </span>
                      </div>
                    ))}
                    {!(selectedMember.payments || []).length && <p className="text-secondary">No payment records.</p>}
                  </div>
                </div>

                {/* Attendance JOIN */}
                <div className="join-data-card card">
                  <h4><Activity size={18}/> Attendance (JOIN)</h4>
                  <div className="data-row">
                    <span>Present This Month:</span>
                    <strong>{selectedMember.attendanceCount ?? selectedMember.ATTENDANCECOUNT ?? 0} days</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button className="close-btn" onClick={() => setIsAddOpen(false)}><X size={22}/></button>
            </div>
            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input required placeholder="Full Name"  value={form.name}   onChange={e => setForm({...form, name: e.target.value})}/>
              <input required placeholder="Phone"      value={form.phone}  onChange={e => setForm({...form, phone: e.target.value})}/>
              <input placeholder="Email"               value={form.email}  onChange={e => setForm({...form, email: e.target.value})}/>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <select value={form.plan_id} onChange={e => setForm({...form, plan_id: e.target.value})}>
                <option value="">Select Plan</option>
                {plans.map(p => <option key={key(p,'plan_id')} value={key(p,'plan_id')}>{key(p,'plan_name')} — ₹{key(p,'price')}</option>)}
              </select>
              <select value={form.trainer_id} onChange={e => setForm({...form, trainer_id: e.target.value})}>
                <option value="">No Trainer</option>
                {trainers.map(t => <option key={key(t,'trainer_id')} value={key(t,'trainer_id')}>{key(t,'name')}</option>)}
              </select>
              <button type="submit" className="btn btn-primary w-full">Save Member to Oracle DB</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
