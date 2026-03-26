import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Departments from './pages/Departments';
import FindDoctors from './pages/FindDoctors';
import BookAppointment from './pages/BookAppointment';
import Contact from './pages/Contact';
import CareDesk from './pages/CareDesk';
import About from './pages/About';

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
            <Route path="/care-desk" element={<CareDesk />} />
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
