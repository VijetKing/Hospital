import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

const API = 'http://localhost:5000/api';
const COLORS = ['#4f6ef7','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#f97316'];
const avatarBg = n => COLORS[(n?.charCodeAt(0)||0) % COLORS.length];
const initial = n => (n?.[0]||'?').toUpperCase();
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
const isToday = d => d ? new Date(d).toDateString() === new Date().toDateString() : false;

/* ── Helpers ── */
function Pill({ label, color='blue' }) {
  return <span className={`pill pill-${color}`}>{label}</span>;
}

function Avatar({ name, size=32, emoji }) {
  return (
    <div className="td-avatar" style={{ width:size, height:size, background: emoji?'#1f2a3c':avatarBg(name), fontSize:emoji?16:13 }}>
      {emoji || initial(name)}
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div className="empty">
      <div className="empty-emoji">{icon}</div>
      <h4>{title}</h4>
      <p>{sub}</p>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast t-${t.type}`}>
          <span className="toast-icon">{t.type==='success'?'✓':t.type==='error'?'✕':'i'}</span>
          <div className="toast-body">
            <strong>{t.type==='success'?'Success':t.type==='error'?'Error':'Info'}</strong>
            <span>{t.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Search SVG ── */
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ══════════════════════════════════════════ */
export default function App() {
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
  const [clock, setClock] = useState(new Date());

  // forms
  const [pName, setPName] = useState('');
  const [dName, setDName] = useState('');
  const [dSpec, setDSpec] = useState('');
  const [aPatient, setAPatient] = useState('');
  const [aDoctor, setADoctor] = useState('');
  const [aDate, setADate] = useState('');
  const [aStatus, setAStatus] = useState('Scheduled');
  const [bPatient, setBPatient] = useState('');
  const [bAmount, setBAmount] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [rxPatient, setRxPatient] = useState('');
  const [rxDoctor, setRxDoctor] = useState('');
  const [rxMed, setRxMed] = useState('');
  const [rxDose, setRxDose] = useState('');

  const toast = useCallback((msg, type='success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p,d,a,b,r] = await Promise.all([
        fetch(`${API}/patients`).then(x=>x.json()),
        fetch(`${API}/doctors`).then(x=>x.json()),
        fetch(`${API}/appointments`).then(x=>x.json()),
        fetch(`${API}/billing`).then(x=>x.json()),
        fetch(`${API}/prescriptions`).then(x=>x.json()),
      ]);
      setPatients(p); setDoctors(d); setAppointments(a); setBilling(b); setPrescriptions(r);
    } catch { toast('Failed to connect to server','error'); }
    setLoading(false);
  }, [toast]);

  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ document.documentElement.setAttribute('data-theme',theme); },[theme]);
  useEffect(()=>{ setSearch(''); },[active]);
  useEffect(()=>{ const t=setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(t); },[]);

  const del = async (entity,id) => {
    try {
      await fetch(`${API}/${entity}/${id}`,{method:'DELETE'});
      toast('Record deleted');
      load();
    } catch { toast('Delete failed','error'); }
  };

  const post = async (url,body,onDone,msg) => {
    try {
      const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!r.ok) throw new Error();
      onDone();
      toast(msg);
      load();
    } catch { toast('Action failed','error'); }
  };

  const addPatient = ()=>{
    if(!pName.trim()) return toast('Enter patient name','error');
    post(`${API}/patients`,{name:pName.trim()},()=>setPName(''),'Patient registered');
  };
  const addDoctor = ()=>{
    if(!dName.trim()) return toast('Enter doctor name','error');
    post(`${API}/doctors`,{name:dName.trim(),specialization:dSpec},()=>{setDName('');setDSpec('');},'Doctor added');
  };
  const addAppointment = ()=>{
    if(!aPatient||!aDoctor||!aDate) return toast('Fill all fields','error');
    post(`${API}/appointments`,{patientId:aPatient,doctorId:aDoctor,date:aDate,status:aStatus},()=>{setAPatient('');setADoctor('');setADate('');setAStatus('Scheduled');},'Appointment booked');
  };
  
  const updateApptStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast('Status updated');
      load();
    } catch {
      toast('Failed to update status', 'error');
    }
  };
  const addBill = ()=>{
    if(!bPatient||!bAmount) return toast('Fill all fields','error');
    post(`${API}/billing`,{patientId:bPatient,amount:Number(bAmount),description:bDesc},()=>{setBPatient('');setBAmount('');setBDesc('');},'Bill created');
  };
  const addRx = ()=>{
    if(!rxPatient||!rxDoctor||!rxMed.trim()) return toast('Fill all fields','error');
    post(`${API}/prescriptions`,{patientId:rxPatient,doctorId:rxDoctor,medicine:rxMed,dosage:rxDose},()=>{setRxPatient('');setRxDoctor('');setRxMed('');setRxDose('');},'Prescription saved');
  };

  const revenue = billing.reduce((s,b)=>s+b.amount,0);
  const q = s => s.toLowerCase().includes(search.toLowerCase());

  const NAV = [
    {name:'Dashboard',icon:'⊞',badge:null},
    {name:'Patients',icon:'👤',badge:patients.length},
    {name:'Doctors',icon:'⚕',badge:doctors.length},
    {name:'Appointments',icon:'◷',badge:appointments.length},
    {name:'Billing',icon:'◈',badge:null},
    {name:'Prescription',icon:'✦',badge:prescriptions.length},
  ];

  const statusPill = s => {
    const m = {Scheduled:'amber',Completed:'green',Cancelled:'red'};
    return <Pill label={s||'Scheduled'} color={m[s]||'amber'}/>;
  };

  return (
    <div className="app">
      <Toast toasts={toasts}/>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen?'':'closed'}`}>
        <div className="sb-brand">
          <div className="sb-brand-icon">🏥</div>
          <div className="sb-brand-text">
            <strong>MediCare</strong>
            <span>HMS v2.0</span>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Main Menu</div>
          {NAV.map(({name,icon,badge})=>(
            <div key={name} className={`sb-item ${active===name?'active':''}`} onClick={()=>setActive(name)}>
              <span className="sb-item-icon">{icon}</span>
              {name}
              {badge!==null && badge>0 && <span className="sb-badge">{badge}</span>}
            </div>
          ))}
        </nav>

        <div className="sb-footer">
          <div className="sb-footer-info">
            <div className="date-label">📅 {new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
            <div className="time-label">{clock.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        {/* HEADER */}
        <header className="header">
          <button className="header-toggle" onClick={()=>setSidebarOpen(o=>!o)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="header-breadcrumb">
            <span>MediCare</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">{active}</span>
          </div>
          <div className="header-right">
            <button className="hdr-btn" onClick={load}>
              <span className={loading?'spin':''}>↻</span> {loading?'Loading…':'Refresh'}
            </button>
            <button className="hdr-btn" onClick={()=>setTheme(t=>t==='light'?'dark':'light')}>
              {theme==='light'?'🌙 Dark':'☀️ Light'}
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        {active==='Dashboard' && (
          <div className="page">
            <div className="page-head">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back — here's what's happening today</p>
              </div>
            </div>

            <div className="stats-grid">
              {[
                {label:'Patients',value:patients.length,icon:'👤',color:'blue',page:'Patients',sub:'Registered'},
                {label:'Doctors',value:doctors.length,icon:'⚕',color:'green',page:'Doctors',sub:'On Staff'},
                {label:'Appointments',value:appointments.length,icon:'◷',color:'amber',page:'Appointments',sub:'Booked'},
                {label:'Revenue',value:`₹${revenue.toLocaleString('en-IN')}`,icon:'◈',color:'red',page:'Billing',sub:'Total Billed'},
                {label:'Prescriptions',value:prescriptions.length,icon:'✦',color:'purple',page:'Prescription',sub:'Issued'},
              ].map(({label,value,icon,color,page,sub})=>(
                <div key={label} className={`stat-card sc-${color}`} onClick={()=>setActive(page)}>
                  <div className="sc-icon-wrap">{icon}</div>
                  <div className="sc-label">{label}</div>
                  <div className="sc-value">{value}</div>
                  <div className="sc-sub">↗ {sub}</div>
                  <span className="sc-arrow">→</span>
                </div>
              ))}
            </div>

            <div className="dash-lower">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">◷ Upcoming Appointments</span>
                  <span className="panel-meta">{appointments.length} total</span>
                </div>
                <div className="activity-list">
                  {appointments.length===0
                    ? <Empty icon="◷" title="No appointments" sub="Book one from the Appointments page"/>
                    : appointments.slice(-5).reverse().map(a=>(
                      <div key={a._id} className="activity-item">
                        <div className="act-dot" style={{background:avatarBg(a.patientId?.name)}}/>
                        <div className="act-content">
                          <strong>{a.patientId?.name||'—'} → Dr. {a.doctorId?.name||'—'}</strong>
                          <span>{fmtDate(a.date)}{isToday(a.date)?' · Today':''}</span>
                        </div>
                        {statusPill(a.status)}
                      </div>
                    ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">◈ Recent Bills</span>
                  <span className="panel-meta">₹{revenue.toLocaleString('en-IN')} total</span>
                </div>
                <div className="activity-list">
                  {billing.length===0
                    ? <Empty icon="◈" title="No bills" sub="Create bills from the Billing page"/>
                    : billing.slice(-5).reverse().map(b=>(
                      <div key={b._id} className="activity-item">
                        <Avatar name={b.patientId?.name} size={28}/>
                        <div className="act-content">
                          <strong>{b.patientId?.name||'—'}</strong>
                          <span>{b.description||'Medical Services'}</span>
                        </div>
                        <Pill label={`₹${b.amount?.toLocaleString('en-IN')}`} color="green"/>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {active==='Patients' && (
          <div className="page">
            <div className="page-head">
              <div><h1>Patients</h1><p>{patients.length} registered patients</p></div>
            </div>
            <div className="panel" style={{marginBottom:20}}>
              <div className="panel-header"><span className="panel-title">➕ Register Patient</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="fg">
                    <label>Full Name</label>
                    <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Patient's full name" onKeyDown={e=>e.key==='Enter'&&addPatient()}/>
                  </div>
                  <button className="btn btn-primary" onClick={addPatient}>Register</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">All Patients</span>
                <div className="search-wrap"><SearchIcon/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patients…"/></div>
              </div>
              {patients.filter(p=>q(p.name)).length===0
                ? <Empty icon="👤" title="No patients found" sub="Register a patient above"/>
                : <table className="data-table">
                    <thead><tr><th>Patient</th><th>ID</th><th>Actions</th></tr></thead>
                    <tbody>
                      {patients.filter(p=>q(p.name)).map((p,i)=>(
                        <tr key={p._id}>
                          <td><div className="td-name"><Avatar name={p.name}/><div className="td-text"><strong>{p.name}</strong><span>Patient</span></div></div></td>
                          <td><Pill label={`#${String(i+1).padStart(3,'0')}`} color="blue"/></td>
                          <td><button className="btn btn-danger-ghost btn-sm" onClick={()=>del('patients',p._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {active==='Doctors' && (
          <div className="page">
            <div className="page-head"><div><h1>Doctors</h1><p>{doctors.length} staff members</p></div></div>
            <div className="panel" style={{marginBottom:20}}>
              <div className="panel-header"><span className="panel-title">➕ Add Doctor</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="fg"><label>Full Name</label><input value={dName} onChange={e=>setDName(e.target.value)} placeholder="Doctor's full name" onKeyDown={e=>e.key==='Enter'&&addDoctor()}/></div>
                  <div className="fg"><label>Specialization</label><input value={dSpec} onChange={e=>setDSpec(e.target.value)} placeholder="e.g. Cardiology"/></div>
                  <button className="btn btn-primary" onClick={addDoctor}>Add Doctor</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Medical Staff</span>
                <div className="search-wrap"><SearchIcon/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctors…"/></div>
              </div>
              {doctors.filter(d=>q(d.name)).length===0
                ? <Empty icon="⚕" title="No doctors found" sub="Add a doctor above"/>
                : <table className="data-table">
                    <thead><tr><th>Doctor</th><th>Specialization</th><th>Actions</th></tr></thead>
                    <tbody>
                      {doctors.filter(d=>q(d.name)).map(d=>(
                        <tr key={d._id}>
                          <td><div className="td-name"><Avatar name={d.name}/><div className="td-text"><strong>Dr. {d.name}</strong><span>Physician</span></div></div></td>
                          <td><Pill label={d.specialization||'General'} color="green"/></td>
                          <td><button className="btn btn-danger-ghost btn-sm" onClick={()=>del('doctors',d._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {active==='Appointments' && (
          <div className="page">
            <div className="page-head"><div><h1>Appointments</h1><p>{appointments.length} total appointments</p></div></div>
            <div className="panel" style={{marginBottom:20}}>
              <div className="panel-header"><span className="panel-title">📅 Book Appointment</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="fg"><label>Patient</label>
                    <select value={aPatient} onChange={e=>setAPatient(e.target.value)}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Doctor</label>
                    <select value={aDoctor} onChange={e=>setADoctor(e.target.value)}>
                      <option value="">Select doctor</option>
                      {doctors.map(d=><option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Date</label><input type="date" value={aDate} onChange={e=>setADate(e.target.value)}/></div>
                  <div className="fg"><label>Status</label>
                    <select value={aStatus} onChange={e=>setAStatus(e.target.value)}>
                      <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={addAppointment}>Book</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">All Appointments</span></div>
              {appointments.length===0
                ? <Empty icon="◷" title="No appointments" sub="Book one above"/>
                : <table className="data-table">
                    <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {appointments.map(a=>(
                        <tr key={a._id} style={isToday(a.date)?{background:'rgba(79,110,247,0.04)'}:{}}>
                          <td><div className="td-name"><Avatar name={a.patientId?.name}/><div className="td-text"><strong>{a.patientId?.name||'—'}</strong></div></div></td>
                          <td>Dr. {a.doctorId?.name||'—'}</td>
                          <td>{fmtDate(a.date)}{isToday(a.date)&&<Pill label="Today" color="blue"/>}</td>
                          <td>
                            <select 
                              className={`status-select status-${(a.status || 'Scheduled').toLowerCase()}`}
                              value={a.status || 'Scheduled'} 
                              onChange={(e) => updateApptStatus(a._id, e.target.value)}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td><button className="btn btn-danger-ghost btn-sm" onClick={()=>del('appointments',a._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
        )}

        {/* BILLING */}
        {active==='Billing' && (
          <div className="page">
            <div className="page-head"><div><h1>Billing</h1><p>Total Revenue: ₹{revenue.toLocaleString('en-IN')}</p></div></div>
            <div className="panel" style={{marginBottom:20}}>
              <div className="panel-header"><span className="panel-title">💰 Create Bill</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="fg"><label>Patient</label>
                    <select value={bPatient} onChange={e=>setBPatient(e.target.value)}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Amount (₹)</label><input type="number" value={bAmount} onChange={e=>setBAmount(e.target.value)} placeholder="0"/></div>
                  <div className="fg"><label>Description</label><input value={bDesc} onChange={e=>setBDesc(e.target.value)} placeholder="e.g. Consultation fee"/></div>
                  <button className="btn btn-primary" onClick={addBill}>Create Bill</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">All Bills</span><span className="panel-meta">{billing.length} records</span></div>
              {billing.length===0
                ? <Empty icon="◈" title="No bills yet" sub="Create a bill above"/>
                : <table className="data-table">
                    <thead><tr><th>Patient</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
                    <tbody>
                      {billing.map(b=>(
                        <tr key={b._id}>
                          <td><div className="td-name"><Avatar name={b.patientId?.name}/><div className="td-text"><strong>{b.patientId?.name||'—'}</strong></div></div></td>
                          <td style={{color:'var(--text2)'}}>{b.description||'Medical Services'}</td>
                          <td><Pill label={`₹${b.amount?.toLocaleString('en-IN')}`} color="green"/></td>
                          <td><button className="btn btn-danger-ghost btn-sm" onClick={()=>del('billing',b._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
        )}

        {/* PRESCRIPTIONS */}
        {active==='Prescription' && (
          <div className="page">
            <div className="page-head"><div><h1>Prescriptions</h1><p>{prescriptions.length} prescriptions issued</p></div></div>
            <div className="panel" style={{marginBottom:20}}>
              <div className="panel-header"><span className="panel-title">💊 New Prescription</span></div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="fg"><label>Patient</label>
                    <select value={rxPatient} onChange={e=>setRxPatient(e.target.value)}>
                      <option value="">Select patient</option>
                      {patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Doctor</label>
                    <select value={rxDoctor} onChange={e=>setRxDoctor(e.target.value)}>
                      <option value="">Select doctor</option>
                      {doctors.map(d=><option key={d._id} value={d._id}>Dr. {d.name}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Medicine</label><input value={rxMed} onChange={e=>setRxMed(e.target.value)} placeholder="Medicine name"/></div>
                  <div className="fg"><label>Dosage</label><input value={rxDose} onChange={e=>setRxDose(e.target.value)} placeholder="e.g. 500mg twice daily"/></div>
                  <button className="btn btn-primary" onClick={addRx}>Save</button>
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">All Prescriptions</span>
                <div className="search-wrap"><SearchIcon/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search medicine…"/></div>
              </div>
              {prescriptions.filter(p=>q(p.medicine||'')).length===0
                ? <Empty icon="💊" title="No prescriptions" sub="Add one above"/>
                : <table className="data-table">
                    <thead><tr><th>Medicine</th><th>Patient</th><th>Doctor</th><th>Dosage</th><th>Actions</th></tr></thead>
                    <tbody>
                      {prescriptions.filter(p=>q(p.medicine||'')).map(p=>(
                        <tr key={p._id}>
                          <td><Pill label={p.medicine} color="purple"/></td>
                          <td>{p.patientId?.name||'—'}</td>
                          <td>Dr. {p.doctorId?.name||'—'}</td>
                          <td style={{color:'var(--text2)',fontSize:12}}>{p.dosage||'—'}</td>
                          <td><button className="btn btn-danger-ghost btn-sm" onClick={()=>del('prescriptions',p._id)}>Delete</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}