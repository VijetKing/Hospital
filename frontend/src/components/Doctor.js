import React, { useState, useEffect } from 'react';

function Doctor() {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data));
  }, []);

  const addDoctor = () => {
    fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(() => window.location.reload());
  };

  return (
    <div>
      <h2>Doctors</h2>

      <input
        type="text"
        placeholder="Enter Doctor Name"
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={addDoctor}>Add</button>

      <ul>
        {doctors.map(d => (
          <li key={d._id}>{d.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Doctor;