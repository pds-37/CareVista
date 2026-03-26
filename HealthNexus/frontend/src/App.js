import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Departments from './pages/Departments';
import FindDoctors from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import Contact from './pages/Contact';
import CareDesk from './pages/CareDesk';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import PortalHome from './pages/PortalHome';
import PatientPortal from './pages/PatientPortal';
import DoctorPortal from './pages/DoctorPortal';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/doctors" element={<FindDoctors />} />
            <Route path="/appointments" element={<BookAppointment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute roles={['patient', 'doctor', 'admin']}>
                  <PortalHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/patient"
              element={
                <ProtectedRoute roles={['patient']}>
                  <PatientPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/doctor"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DoctorPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CareDesk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/care-desk"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CareDesk />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
