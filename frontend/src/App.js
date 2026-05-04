import React from 'react';
import Patient from './components/Patient';
import Doctor from './components/Doctor';
import './App.css';

function App() {
  return (
    <div>
      <h1>Hospital Management System</h1>
      <Patient />
      <Doctor />
    </div>
  );
}

export default App;