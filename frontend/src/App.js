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
    fetch('http://localhost:5000/api/patients')
      .then(res => res.json())
      .then(setPatients);

    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(setDoctors);

    fetch('http://localhost:5000/api/appointments')
      .then(res => res.json())
      .then(setAppointments);

    fetch('http://localhost:5000/api/billing')
      .then(res => res.json())
      .then(setBilling);

    fetch('http://localhost:5000/api/prescriptions')
      .then(res => res.json())
      .then(setPrescriptions);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ADD PATIENT
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

  // ADD DOCTOR
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

  // ADD APPOINTMENT
  const addAppointment = async () => {
    if (!selectedPatient || !selectedDoctor || !date) {
      return alert("Fill all fields");
    }

    await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        date
      })
    });

    setSelectedPatient('');
    setSelectedDoctor('');
    setDate('');

    loadData();
  };

  // ADD BILL
  const addBill = async () => {
    if (!billPatient || !amount) {
      return alert("Fill all fields");
    }

    await fetch('http://localhost:5000/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: billPatient,
        amount: Number(amount)
      })
    });

    setBillPatient('');
    setAmount('');

    loadData();
  };

  // ADD PRESCRIPTION
  const addPrescription = async () => {

    if (
      presPatient === '' ||
      presDoctor === '' ||
      medicine.trim() === ''
    ) {
      return alert("Fill all fields");
    }

    try {

      const response = await fetch(
        'http://localhost:5000/api/prescriptions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId: presPatient,
            doctorId: presDoctor,
            medicine: medicine
          })
        }
      );

      const data = await response.json();

      console.log(data);

      setPresPatient('');
      setPresDoctor('');
      setMedicine('');

      loadData();

    } catch (error) {
      console.log(error);
      alert("Error adding prescription");
    }
  };

  const totalAmount = billing.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="app">

      <button
        className="menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>

        <h2>🏥 HMS</h2>

        <ul>
          {[
            'Dashboard',
            'Patients',
            'Doctors',
            'Appointments',
            'Billing',
            'Prescription'
          ].map(item => (
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

      {/* MAIN */}
      <div className="main">

        <h1>{active}</h1>

        {/* DASHBOARD */}
{active === 'Dashboard' && (
  <div className="dashboard">

    {/* PATIENTS */}
    <div
      className="card blue"
      onClick={() => setActive('Patients')}
    >
      <h3>Patients</h3>
      <p>{patients.length}</p>

      <span className="card-link">
        
      </span>
    </div>

    {/* DOCTORS */}
    <div
      className="card green"
      onClick={() => setActive('Doctors')}
    >
      <h3>Doctors</h3>
      <p>{doctors.length}</p>

      <span className="card-link">
        
      </span>
    </div>

    {/* APPOINTMENTS */}
    <div
      className="card orange"
      onClick={() => setActive('Appointments')}
    >
      <h3>Appointments</h3>
      <p>{appointments.length}</p>

      <span className="card-link">
        
      </span>
    </div>

    {/* BILLING */}
    <div
      className="card red"
      onClick={() => setActive('Billing')}
    >
      <h3>Billing</h3>
      <p>₹{totalAmount}</p>

      <span className="card-link">
        
      </span>
    </div>

    {/* PRESCRIPTION */}
    <div
      className="card purple"
      onClick={() => setActive('Prescription')}
    >
      <h3>Prescription</h3>
      <p>{prescriptions.length}</p>

      <span className="card-link">
        
      </span>
    </div>

  </div>
)}

        {/* PATIENTS */}
        {active === 'Patients' && (
          <div className="section">

            <h2>Patients</h2>

            <div className="form">
              <input
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Enter Patient Name"
              />

              <button onClick={addPatient}>
                Add
              </button>
            </div>

            <div className="list">
              {patients.map(p => (
                <div key={p._id} className="item">
                  {p.name}
                </div>
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
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                placeholder="Enter Doctor Name"
              />

              <button onClick={addDoctor}>
                Add
              </button>
            </div>

            <div className="list">
              {doctors.map(d => (
                <div key={d._id} className="item">
                  {d.name}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* APPOINTMENTS */}
        {active === 'Appointments' && (
          <div className="section">

            <h2>Appointments</h2>

            <div className="form">

              <select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
              >
                <option value="">Select Patient</option>

                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDoctor}
                onChange={e => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select Doctor</option>

                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />

              <button onClick={addAppointment}>
                Book
              </button>

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

              <select
                value={billPatient}
                onChange={e => setBillPatient(e.target.value)}
              >
                <option value="">Select Patient</option>

                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={amount}
                placeholder="Amount"
                onChange={e => setAmount(e.target.value)}
              />

              <button onClick={addBill}>
                Add Bill
              </button>

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

              {/* Patient */}
              <select
                value={presPatient}
                onChange={(e) => setPresPatient(e.target.value)}
              >
                <option value="">Select Patient</option>

                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Doctor */}
              <select
                value={presDoctor}
                onChange={(e) => setPresDoctor(e.target.value)}
              >
                <option value="">Select Doctor</option>

                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Medicine */}
              <input
                type="text"
                value={medicine}
                placeholder="Enter Medicine"
                onChange={(e) => setMedicine(e.target.value)}
              />

              <button onClick={addPrescription}>
                Add
              </button>

            </div>

            {/* LIST */}
            <div className="list">

              {prescriptions.length === 0 ? (
                <p>No prescriptions yet</p>
              ) : (
                prescriptions.map((p) => (
                  <div key={p._id} className="item">

                    {p.patientId?.name}
                    {' → '}
                    {p.doctorId?.name}
                    {' : '}
                    <strong>{p.medicine}</strong>

                  </div>
                ))
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;