import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        </Route>

        {/* Catch all - Redirect to login if not authenticated (handled by ProtectedRoute), or just redirect to home if authenticated but 404 */}
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={<Login />} />
          {/* Using Login component here or Navigate to "/"? Navigate to "/" is cleaner but generic. */}
          {/* If I use Navigate to "/", it goes to path="/" which is Login. */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
