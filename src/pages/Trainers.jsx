import { useState, useEffect } from 'react';
import { Plus, Phone, Users, X } from 'lucide-react';
import { getTrainers, addTrainer } from '../services';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', phone: '', email: '' });

  const key = (obj, k) => obj[k] || obj[k.toUpperCase()] || '';

  const fetchTrainers = async () => {
    setLoading(true);
    const data = await getTrainers();
    setTrainers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addTrainer(form);
    setIsAddOpen(false);
    fetchTrainers();
  };

  if (loading) return <div className="loading-state">Loading from Oracle DB...</div>;

  return (
    <div className="trainers-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trainers</h1>
          <p className="text-secondary" style={{ marginTop: '6px' }}>Aggregate JOIN: Trainers + COUNT(Members assigned)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={20}/> Add Trainer
        </button>
      </div>

      <div className="grid-cols-3" style={{ display:'grid', gap:'var(--spacing-6)' }}>
        {trainers.map(trainer => (
          <div key={key(trainer,'trainer_id')} className="card">
            <div className="flex-center gap-4 mb-4">
              <div className="large-avatar" style={{ width:60, height:60, fontSize:'1.5rem' }}>
                {key(trainer,'name').charAt(0)}
              </div>
              <div>
                <h3>{key(trainer,'name')}</h3>
                <p className="text-secondary">{key(trainer,'specialization')}</p>
              </div>
            </div>

            <div className="data-row mb-2">
              <span className="flex-center gap-2"><Phone size={16}/> Phone</span>
              <span>{key(trainer,'phone')}</span>
            </div>

            <div className="card mt-4" style={{ backgroundColor:'var(--bg-primary)', padding:'12px' }}>
              <p className="flex-center gap-2 text-secondary" style={{ fontSize:'0.9rem' }}>
                <Users size={16}/> <strong style={{ color:'var(--text-primary)' }}>{key(trainer,'total_members') || key(trainer,'TOTAL_MEMBERS') || 0}</strong>&nbsp; members assigned
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" style={{ maxWidth:'460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Trainer</h2>
              <button className="close-btn" onClick={() => setIsAddOpen(false)}><X size={22}/></button>
            </div>
            <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <input required placeholder="Full Name"       value={form.name}           onChange={e => setForm({...form, name: e.target.value})}/>
              <input placeholder="Specialization"          value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}/>
              <input required placeholder="Phone"           value={form.phone}          onChange={e => setForm({...form, phone: e.target.value})}/>
              <input placeholder="Email"                   value={form.email}          onChange={e => setForm({...form, email: e.target.value})}/>
              <button type="submit" className="btn btn-primary w-full">INSERT into Trainers Table</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
