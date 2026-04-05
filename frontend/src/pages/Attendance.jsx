import { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { getAttendance, markAttendance, getMembersList } from '../services';

const Attendance = () => {
  const [filterDate, setFilterDate]   = useState(new Date().toISOString().split('T')[0]);
  const [membersList, setMembersList] = useState([]);
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);

  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || '';

  const fetchLogs = async () => {
    const data = await getAttendance(filterDate);
    setLogs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [mems] = await Promise.all([getMembersList(), fetchLogs()]);
      setMembersList(Array.isArray(mems) ? mems : []);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { fetchLogs(); }, [filterDate]);

  const handleMarkPresent = async (memberId) => {
    await markAttendance(memberId);
    fetchLogs();
  };

  const isPresent = (memberId) =>
    logs.some(l => parseInt(key(l,'member_id') || key(l,'MEMBER_ID')) === memberId);

  if (loading) return <div className="loading-state">Loading from Oracle DB...</div>;

  return (
    <div className="attendance-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance</h1>
          <p className="text-secondary" style={{ marginTop:'6px' }}>MERGE query — prevents duplicate entries (Attendance table)</p>
        </div>
        <div className="flex-center gap-2 card" style={{ padding:'8px 16px' }}>
          <Clock size={18} color="var(--text-secondary)"/>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ border:'none', background:'transparent' }}
          />
        </div>
      </div>

      <div className="grid-cols-2" style={{ display:'grid', gap:'var(--spacing-6)' }}>
        {/* Quick Check-in */}
        <div className="card">
          <h3 className="mb-4">Quick Check-in</h3>
          <div style={{ maxHeight:'500px', overflowY:'auto' }}>
            {membersList.map(member => {
              const id = parseInt(key(member,'member_id'));
              const present = isPresent(id);
              return (
                <div key={id} className="flex-center" style={{ justifyContent:'space-between', padding:'12px', borderBottom:'1px solid var(--border-color)' }}>
                  <div className="flex-center gap-3">
                    <div className="mini-avatar">{key(member,'name').charAt(0)}</div>
                    <div>
                      <strong>{key(member,'name')}</strong>
                      <p className="text-secondary" style={{ fontSize:'0.85rem' }}>{key(member,'phone')}</p>
                    </div>
                  </div>
                  {present ? (
                    <span className="status-badge status-active"><CheckCircle size={14}/> Present</span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ padding:'6px 14px', fontSize:'0.85rem' }}
                      onClick={() => handleMarkPresent(id)}
                    >
                      Mark Present
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div className="card">
          <h3 className="mb-4">Check-in Logs — {filterDate}</h3>
          {logs.length === 0 ? (
            <p className="text-center text-secondary py-4">No check-ins for this date.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {logs.map((rec, i) => (
                <div key={i} className="card flex-center gap-3" style={{ padding:'12px', backgroundColor:'var(--bg-primary)' }}>
                  <CheckCircle color="var(--status-active)" size={20}/>
                  <div>
                    <strong>{key(rec,'member_name')}</strong>
                    <span className="text-secondary ml-2" style={{ fontSize:'0.85rem' }}>at {key(rec,'check_in_time')}</span>
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

export default Attendance;
