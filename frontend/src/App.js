import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [active, setActive] = useState('Dashboard');

  useEffect(() => {
    fetch('http://localhost:5000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data));

    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

  const addPatient = () => {
    fetch('http://localhost:5000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: patientName })
    }).then(() => window.location.reload());
  };

  const addDoctor = () => {
    fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: doctorName })
    }).then(() => window.location.reload());
  };

  return (
    <div className="app">

      {/* ☰ Toggle */}
      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
        <h2>🏥 HMS</h2>
        <ul>
          {['Dashboard','Patients','Doctors','Appointments','Billing'].map(item => (
            <li
              key={item}
              className={active === item ? 'active' : ''}
              onClick={() => setActive(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Main */}
      <div className={`main ${sidebarOpen ? '' : 'full'}`}>
        <h1>{active}</h1>

        {/* DASHBOARD */}
        {active === 'Dashboard' && (
          <div className="dashboard">
            <div className="card blue">
              <h3>Patients</h3>
              <p>{patients.length}</p>
            </div>
            <div className="card green">
              <h3>Doctors</h3>
              <p>{doctors.length}</p>
            </div>
            <div className="card orange">
              <h3>Appointments</h3>
              <p>0</p>
            </div>
            <div className="card red">
              <h3>Billing</h3>
              <p>₹0</p>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {active === 'Patients' && (
          <div className="section">
            <h2>Patients</h2>
            <div className="form">
              <input
                placeholder="Enter Patient Name"
                onChange={(e) => setPatientName(e.target.value)}
              />
              <button onClick={addPatient}>Add</button>
            </div>

            <div className="list">
              {patients.map(p => (
                <div className="item" key={p._id}>{p.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* DOCTORS */}
        {active === 'Doctors' && (
          <div className="section">
            <h2>Doctors</h2>
            <div className="form">
              <input
                placeholder="Enter Doctor Name"
                onChange={(e) => setDoctorName(e.target.value)}
              />
              <button onClick={addDoctor}>Add</button>
            </div>

            <div className="list">
              {doctors.map(d => (
                <div className="item" key={d._id}>{d.name}</div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY PAGES */}
        {active === 'Appointments' && <h2>Appointments Page Coming Soon</h2>}
        {active === 'Billing' && <h2>Billing Page Coming Soon</h2>}

      </div>
    </div>
  );
}

export default App;