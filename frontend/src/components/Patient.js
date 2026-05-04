import React, { useState, useEffect } from 'react';

function Patient() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);

  const addPatient = () => {
    fetch('http://localhost:5000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h2>Patients</h2>
      <input onChange={(e) => setName(e.target.value)} />
      <button onClick={addPatient}>Add</button>

      <ul>
        {patients.map(p => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Patient;