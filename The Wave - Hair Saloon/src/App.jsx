import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Layout    from './components/Layout';
import HomePage  from './pages/HomePage';
import Inventory from './pages/Inventory';
import Membership from './pages/Membership';
import Appointments from './pages/Appointments';
import Sales     from './pages/Sales';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route element={<Layout />}>
        <Route path="/home"       element={<HomePage />}  />
        <Route path="/inventory"  element={<Inventory />} />
        <Route path="/membership" element={<Membership />}/>
        <Route path="/appointments" element={<Appointments />}/>
        <Route path="/sales"      element={<Sales />}     />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
