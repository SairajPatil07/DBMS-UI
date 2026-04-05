import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard  from './pages/Dashboard';
import Members    from './pages/Members';
import Plans      from './pages/Plans';
import Trainers   from './pages/Trainers';
import Payments   from './pages/Payments';
import Attendance from './pages/Attendance';
import Equipment  from './pages/Equipment';
import Login      from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Main App (Protected Layout) */}
        <Route path="/" element={<MainLayout />}>
          <Route index                  element={<Dashboard />} />
          <Route path="members"         element={<Members />} />
          <Route path="plans"           element={<Plans />} />
          <Route path="trainers"        element={<Trainers />} />
          <Route path="payments"        element={<Payments />} />
          <Route path="attendance"      element={<Attendance />} />
          <Route path="equipment"       element={<Equipment />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
