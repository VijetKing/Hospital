import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');

  const [billPatient, setBillPatient] = useState('');
  const [amount, setAmount] = useState('');

  const [presPatient, setPresPatient] = useState('');
  const [presDoctor, setPresDoctor] = useState('');
  const [medicine, setMedicine] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('Dashboard');

  // LOAD DATA
  const loadData = () => {
    fetch('http://localhost:5000/api/patients').then(res => res.json()).then(setPatients);
    fetch('http://localhost:5000/api/doctors').then(res => res.json()).then(setDoctors);
    fetch('http://localhost:5000/api/appointments').then(res => res.json()).then(setAppointments);
    fetch('http://localhost:5000/api/billing').then(res => res.json()).then(setBilling);
    fetch('http://localhost:5000/api/prescriptions').then(res => res.json()).then(setPrescriptions);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD FUNCTIONS
  const addPatient = async () => {
    if (!patientName) return alert("Enter patient name");
    await fetch('http://localhost:5000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: patientName })
    });
    setPatientName('');
    loadData();
  };

  const addDoctor = async () => {
    if (!doctorName) return alert("Enter doctor name");
    await fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: doctorName })
    });
    setDoctorName('');
    loadData();
  };

  const addAppointment = async () => {
    if (!selectedPatient || !selectedDoctor || !date) return alert("Fill all fields");
    await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: selectedPatient, doctorId: selectedDoctor, date })
    });
    setSelectedPatient('');
    setSelectedDoctor('');
    setDate('');
    loadData();
  };

  const addBill = async () => {
    if (!billPatient || !amount) return alert("Fill all fields");
    await fetch('http://localhost:5000/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: billPatient, amount: Number(amount) })
    });
    setBillPatient('');
    setAmount('');
    loadData();
  };

  const addPrescription = async () => {
    if (!presPatient || !presDoctor || !medicine) return alert("Fill all fields");
    await fetch('http://localhost:5000/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: presPatient, doctorId: presDoctor, medicine })
    });
    setPresPatient('');
    setPresDoctor('');
    setMedicine('');
    loadData();
  };

  const totalAmount = billing.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="app">

      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <h2>🏥 HMS</h2>
        <ul>
          {['Dashboard','Patients','Doctors','Appointments','Billing','Prescription'].map(item => (
            <li key={item}
                className={active === item ? 'active' : ''}
                onClick={() => setActive(item)}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="main">
        <h1>{active}</h1>

        {/* DASHBOARD */}
        {active === 'Dashboard' && (
          <div className="dashboard">
            <div className="card blue"><h3>Patients</h3><p>{patients.length}</p></div>
            <div className="card green"><h3>Doctors</h3><p>{doctors.length}</p></div>
            <div className="card orange"><h3>Appointments</h3><p>{appointments.length}</p></div>
            <div className="card red"><h3>Billing</h3><p>₹{totalAmount}</p></div>
            <div className="card purple"><h3>Prescription</h3><p>{prescriptions.length}</p></div>
          </div>
        )}

        {/* PATIENTS */}
        {active === 'Patients' && (
          <div className="section">
            <h2>Patients</h2>
            <div className="form">
              <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Enter Patient Name"/>
              <button onClick={addPatient}>Add</button>
            </div>
            <div className="list">
              {patients.map(p => <div key={p._id} className="item">{p.name}</div>)}
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {active === 'Doctors' && (
          <div className="section">
            <h2>Doctors</h2>
            <div className="form">
              <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Enter Doctor Name"/>
              <button onClick={addDoctor}>Add</button>
            </div>
            <div className="list">
              {doctors.map(d => <div key={d._id} className="item">{d.name}</div>)}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {active === 'Appointments' && (
          <div className="section">
            <h2>Appointments</h2>
            <div className="form">
              <select onChange={e => setSelectedPatient(e.target.value)}>
                <option>Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <select onChange={e => setSelectedDoctor(e.target.value)}>
                <option>Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>

              <input type="date" onChange={e => setDate(e.target.value)} />
              <button onClick={addAppointment}>Book</button>
            </div>

            <div className="list">
              {appointments.map(a => (
                <div key={a._id} className="item">
                  {a.patientId?.name} → {a.doctorId?.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BILLING */}
        {active === 'Billing' && (
          <div className="section">
            <h2>Billing</h2>
            <div className="form">
              <select onChange={e => setBillPatient(e.target.value)}>
                <option>Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <input type="number" placeholder="Amount" onChange={e => setAmount(e.target.value)} />
              <button onClick={addBill}>Add Bill</button>
            </div>

            <div className="list">
              {billing.map(b => (
                <div key={b._id} className="item">
                  {b.patientId?.name} — ₹{b.amount}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRESCRIPTION */}
        {active === 'Prescription' && (
          <div className="section">
            <h2>Prescription</h2>
            <div className="form">
              <select onChange={e => setPresPatient(e.target.value)}>
                <option>Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <select onChange={e => setPresDoctor(e.target.value)}>
                <option>Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>

              <input placeholder="Medicine" onChange={e => setMedicine(e.target.value)} />
              <button onClick={addPrescription}>Add</button>
            </div>

            <div className="list">
              {prescriptions.map(p => (
                <div key={p._id} className="item">
                  {p.patientId?.name} → {p.doctorId?.name} : {p.medicine}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;