import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

const API = 'http://localhost:5000/api';

// ── Toast System ──────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Avatar color helper ───────────────────────────────────
const COLORS = ['#6366f1','#8b5cf6','#3b82f6','#0ea5e9','#22c55e','#f59e0b','#ef4444','#ec4899'];
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];

// ── Main App ──────────────────────────────────────────────
function App() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [active, setActive] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState('');

  // form fields
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpec, setDoctorSpec] = useState('');
  const [selPatient, setSelPatient] = useState('');
  const [selDoctor, setSelDoctor] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptStatus, setApptStatus] = useState('Scheduled');
  const [billPatient, setBillPatient] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDesc, setBillDesc] = useState('');
  const [presPatient, setPresPatient] = useState('');
  const [presDoctor, setPresDoctor] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, d, a, b, rx] = await Promise.all([
        fetch(`${API}/patients`).then(r => r.json()),
        fetch(`${API}/doctors`).then(r => r.json()),
        fetch(`${API}/appointments`).then(r => r.json()),
        fetch(`${API}/billing`).then(r => r.json()),
        fetch(`${API}/prescriptions`).then(r => r.json()),
      ]);
      setPatients(p); setDoctors(d); setAppointments(a); setBilling(b); setPrescriptions(rx);
    } catch { toast('Failed to load data', 'error'); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => { setSearch(''); }, [active]);

  const del = async (entity, id) => {
    try {
      await fetch(`${API}/${entity}/${id}`, { method: 'DELETE' });
      toast(`Deleted successfully`);
      loadData();
    } catch { toast('Delete failed', 'error'); }
  };

  const addPatient = async () => {
    if (!patientName.trim()) return toast('Enter patient name', 'error');
    await fetch(`${API}/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: patientName.trim() }) });
    setPatientName(''); toast('Patient added! 🎉'); loadData();
  };

  const addDoctor = async () => {
    if (!doctorName.trim()) return toast('Enter doctor name', 'error');
    await fetch(`${API}/doctors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: doctorName.trim(), specialization: doctorSpec }) });
    setDoctorName(''); setDoctorSpec(''); toast('Doctor added! 👨‍⚕️'); loadData();
  };

  const addAppointment = async () => {
    if (!selPatient || !selDoctor || !apptDate) return toast('Fill all fields', 'error');
    await fetch(`${API}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: selPatient, doctorId: selDoctor, date: apptDate, status: apptStatus }) });
    setSelPatient(''); setSelDoctor(''); setApptDate(''); setApptStatus('Scheduled');
    toast('Appointment booked! 📅'); loadData();
  };

  const addBill = async () => {
    if (!billPatient || !billAmount) return toast('Fill all fields', 'error');
    await fetch(`${API}/billing`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: billPatient, amount: Number(billAmount), description: billDesc }) });
    setBillPatient(''); setBillAmount(''); setBillDesc('');
    toast('Bill created! 💰'); loadData();
  };

  const addPrescription = async () => {
    if (!presPatient || !presDoctor || !medicine.trim()) return toast('Fill all fields', 'error');
    await fetch(`${API}/prescriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: presPatient, doctorId: presDoctor, medicine, dosage }) });
    setPresPatient(''); setPresDoctor(''); setMedicine(''); setDosage('');
    toast('Prescription added! 💊'); loadData();
  };

  const totalRevenue = billing.reduce((s, b) => s + b.amount, 0);

  const navItems = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Patients', icon: '🧑‍🤝‍🧑' },
    { name: 'Doctors', icon: '👨‍⚕️' },
    { name: 'Appointments', icon: '📅' },
    { name: 'Billing', icon: '💰' },
    { name: 'Prescription', icon: '💊' },
  ];

  const filtered = (arr, keys) =>
    arr.filter(item => keys.some(k => (item[k] || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="app">
      <ToastContainer toasts={toasts} />

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>
          <div>
            <h2>MediCare</h2>
            <span>Hospital Management</span>
          </div>
        </div>
        <div className="nav-label">Navigation</div>
        <ul>
          {navItems.map(({ name, icon }) => (
            <li key={name} className={active === name ? 'active' : ''} onClick={() => setActive(name)}>
              <span className="nav-icon">{icon}</span> {name}
            </li>
          ))}
        </ul>
        <div className="sidebar-bottom">
          <li style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, color: '#64748b', fontSize: 13 }}>
            <span>🕐</span> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </li>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div>
              <div className="page-title">{active}</div>
              <div className="page-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
          </div>
          <div className="topbar-right">
            <button className="refresh-btn" onClick={loadData}>
              <span className={loading ? 'spinning' : ''}>🔄</span> Refresh
            </button>
            <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        {/* DASHBOARD */}
        {active === 'Dashboard' && (
          <div className="section">
            <div className="dashboard-grid">
              {[
                { label: 'Total Patients', value: patients.length, icon: '🧑‍🤝‍🧑', color: 'blue', page: 'Patients', sub: 'Registered' },
                { label: 'Total Doctors', value: doctors.length, icon: '👨‍⚕️', color: 'green', page: 'Doctors', sub: 'On Staff' },
                { label: 'Appointments', value: appointments.length, icon: '📅', color: 'orange', page: 'Appointments', sub: 'Booked' },
                { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'red', page: 'Billing', sub: 'Total Billed' },
                { label: 'Prescriptions', value: prescriptions.length, icon: '💊', color: 'purple', page: 'Prescription', sub: 'Issued' },
              ].map(({ label, value, icon, color, page, sub }) => (
                <div key={label} className={`stat-card ${color}`} onClick={() => setActive(page)}>
                  <div className="stat-icon">{icon}</div>
                  <h4>{label}</h4>
                  <div className="stat-number">{value}</div>
                  <div className="stat-label">{sub}</div>
                  <span className="stat-arrow">→</span>
                </div>
              ))}
            </div>

            <div className="recent-section">
              <h3>📋 Recent Activity</h3>
              <div className="activity-list">
                {[
                  ...appointments.slice(-3).map(a => ({ text: `Appointment: ${a.patientId?.name || '?'} → Dr. ${a.doctorId?.name || '?'}`, color: 'orange', time: a.date ? new Date(a.date).toLocaleDateString() : '—' })),
                  ...billing.slice(-2).map(b => ({ text: `Bill: ${b.patientId?.name || '?'} — ₹${b.amount}`, color: 'red', time: '—' })),
                  ...prescriptions.slice(-2).map(p => ({ text: `Rx: ${p.medicine} → ${p.patientId?.name || '?'}`, color: 'purple', time: '—' })),
                ].slice(0, 6).map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-dot ${a.color}`} />
                    <span className="activity-text">{a.text}</span>
                    <span className="activity-time">{a.time}</span>
                  </div>
                ))}
                {appointments.length === 0 && billing.length === 0 && prescriptions.length === 0 && (
                  <div className="empty-state"><div className="empty-icon">📭</div><h4>No activity yet</h4><p>Add patients and appointments to get started</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {active === 'Patients' && (
          <div className="section">
            <div className="section-header">
              <h2>Patients</h2>
              <span className="count-badge">{patients.length} Total</span>
            </div>
            <div className="form-card">
              <h3>➕ Register New Patient</h3>
              <div className="form">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" onKeyDown={e => e.key === 'Enter' && addPatient()} />
                </div>
                <button className="btn-primary" onClick={addPatient}>Register Patient</button>
              </div>
            </div>
            <div className="list-card">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…" />
              </div>
              <div className="list">
                {filtered(patients, ['name']).length === 0
                  ? <div className="empty-state"><div className="empty-icon">🧑‍🤝‍🧑</div><h4>No patients found</h4><p>Try a different search or register a new patient</p></div>
                  : filtered(patients, ['name']).map((p, i) => (
                    <div key={p._id} className="item">
                      <div className="item-avatar" style={{ background: avatarColor(p.name) }}>{p.name?.[0]?.toUpperCase()}</div>
                      <div className="item-info">
                        <div className="item-name">{p.name}</div>
                        <div className="item-meta">Patient #{i + 1}</div>
                      </div>
                      <span className="badge badge-blue">Patient</span>
                      <button className="btn-danger" onClick={() => del('patients', p._id)} title="Delete">🗑️</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {active === 'Doctors' && (
          <div className="section">
            <div className="section-header">
              <h2>Doctors</h2>
              <span className="count-badge">{doctors.length} Total</span>
            </div>
            <div className="form-card">
              <h3>➕ Add New Doctor</h3>
              <div className="form">
                <div className="form-group">
                  <label>Doctor Name</label>
                  <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Full name" onKeyDown={e => e.key === 'Enter' && addDoctor()} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input value={doctorSpec} onChange={e => setDoctorSpec(e.target.value)} placeholder="e.g. Cardiology" />
                </div>
                <button className="btn-primary" onClick={addDoctor}>Add Doctor</button>
              </div>
            </div>
            <div className="list-card">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors…" />
              </div>
              <div className="list">
                {filtered(doctors, ['name']).length === 0
                  ? <div className="empty-state"><div className="empty-icon">👨‍⚕️</div><h4>No doctors found</h4><p>Add a doctor to get started</p></div>
                  : filtered(doctors, ['name']).map((d, i) => (
                    <div key={d._id} className="item">
                      <div className="item-avatar" style={{ background: avatarColor(d.name) }}>{d.name?.[0]?.toUpperCase()}</div>
                      <div className="item-info">
                        <div className="item-name">Dr. {d.name}</div>
                        <div className="item-meta">{d.specialization || 'General Practitioner'}</div>
                      </div>
                      <span className="badge badge-green">Doctor</span>
                      <button className="btn-danger" onClick={() => del('doctors', d._id)} title="Delete">🗑️</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {active === 'Appointments' && (
          <div className="section">
            <div className="section-header">
              <h2>Appointments</h2>
              <span className="count-badge">{appointments.length} Total</span>
            </div>
            <div className="form-card">
              <h3>📅 Book Appointment</h3>
              <div className="form">
                <div className="form-group">
                  <label>Patient</label>
                  <select value={selPatient} onChange={e => setSelPatient(e.target.value)}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select value={selDoctor} onChange={e => setSelDoctor(e.target.value)}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={apptStatus} onChange={e => setApptStatus(e.target.value)}>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={addAppointment}>Book</button>
              </div>
            </div>
            <div className="list-card">
              <div className="list">
                {appointments.length === 0
                  ? <div className="empty-state"><div className="empty-icon">📅</div><h4>No appointments</h4><p>Book one above</p></div>
                  : appointments.map(a => {
                      const today = new Date().toDateString();
                      const apptDay = a.date ? new Date(a.date).toDateString() : '';
                      const isToday = today === apptDay;
                      const statusColor = a.status === 'Completed' ? 'badge-green' : a.status === 'Cancelled' ? 'badge-red' : 'badge-orange';
                      return (
                        <div key={a._id} className="item" style={isToday ? { borderLeft: '3px solid #6366f1' } : {}}>
                          <div className="item-avatar" style={{ background: avatarColor(a.patientId?.name) }}>📅</div>
                          <div className="item-info">
                            <div className="item-name">{a.patientId?.name || '—'} → Dr. {a.doctorId?.name || '—'}</div>
                            <div className="item-meta">{a.date ? new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'} {isToday && '• Today!'}</div>
                          </div>
                          <span className={`badge ${statusColor}`}>{a.status || 'Scheduled'}</span>
                          <button className="btn-danger" onClick={() => del('appointments', a._id)}>🗑️</button>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        )}

        {/* BILLING */}
        {active === 'Billing' && (
          <div className="section">
            <div className="section-header">
              <h2>Billing</h2>
              <span className="count-badge">₹{totalRevenue.toLocaleString()} Total</span>
            </div>
            <div className="form-card">
              <h3>💰 Create Bill</h3>
              <div className="form">
                <div className="form-group">
                  <label>Patient</label>
                  <select value={billPatient} onChange={e => setBillPatient(e.target.value)}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={billDesc} onChange={e => setBillDesc(e.target.value)} placeholder="e.g. Consultation" />
                </div>
                <button className="btn-primary" onClick={addBill}>Add Bill</button>
              </div>
            </div>
            <div className="list-card">
              <div className="list">
                {billing.length === 0
                  ? <div className="empty-state"><div className="empty-icon">💰</div><h4>No bills yet</h4><p>Create a bill above</p></div>
                  : billing.map(b => (
                    <div key={b._id} className="item">
                      <div className="item-avatar" style={{ background: avatarColor(b.patientId?.name) }}>{b.patientId?.name?.[0]?.toUpperCase() || '?'}</div>
                      <div className="item-info">
                        <div className="item-name">{b.patientId?.name || '—'}</div>
                        <div className="item-meta">{b.description || 'Medical Services'}</div>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: 13, fontWeight: 700 }}>₹{b.amount?.toLocaleString()}</span>
                      <button className="btn-danger" onClick={() => del('billing', b._id)}>🗑️</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS */}
        {active === 'Prescription' && (
          <div className="section">
            <div className="section-header">
              <h2>Prescriptions</h2>
              <span className="count-badge">{prescriptions.length} Total</span>
            </div>
            <div className="form-card">
              <h3>💊 New Prescription</h3>
              <div className="form">
                <div className="form-group">
                  <label>Patient</label>
                  <select value={presPatient} onChange={e => setPresPatient(e.target.value)}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <select value={presDoctor} onChange={e => setPresDoctor(e.target.value)}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Medicine</label>
                  <input value={medicine} onChange={e => setMedicine(e.target.value)} placeholder="e.g. Paracetamol" />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g. 500mg twice daily" />
                </div>
                <button className="btn-primary" onClick={addPrescription}>Add</button>
              </div>
            </div>
            <div className="list-card">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine…" />
              </div>
              <div className="list">
                {filtered(prescriptions, ['medicine']).length === 0
                  ? <div className="empty-state"><div className="empty-icon">💊</div><h4>No prescriptions</h4><p>Add one above</p></div>
                  : filtered(prescriptions, ['medicine']).map(p => (
                    <div key={p._id} className="item">
                      <div className="item-avatar" style={{ background: '#8b5cf6' }}>💊</div>
                      <div className="item-info">
                        <div className="item-name">{p.medicine}</div>
                        <div className="item-meta">{p.patientId?.name || '—'} · Dr. {p.doctorId?.name || '—'}{p.dosage ? ` · ${p.dosage}` : ''}</div>
                      </div>
                      <span className="badge badge-purple">Rx</span>
                      <button className="btn-danger" onClick={() => del('prescriptions', p._id)}>🗑️</button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;